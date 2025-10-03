import os
import re
import pickle
import csv
from pathlib import Path
from typing import List, Dict, Tuple, Any

from rapidfuzz import process, fuzz

# Optional NLTK lemmatization with graceful fallback
try:
    import nltk
    from nltk.stem import WordNetLemmatizer
    _lemmatizer = WordNetLemmatizer()

    def _lemmatize(w: str) -> str:
        try:
            return _lemmatizer.lemmatize(w)
        except Exception:
            # If wordnet is missing or any NLTK error occurs, return the original token
            return w
except Exception:
    def _lemmatize(w: str) -> str:
        return w


def _simple_tokenize(text: str) -> List[str]:
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    tokens = [t for t in text.split() if t]
    return tokens


class PredictorService:
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self._load_data()

    def _load_pickle(self, name: str):
        path = self.data_dir / name
        if not path.exists():
            return None
        with open(path, 'rb') as f:
            return pickle.load(f)

    def _load_data(self):
        # Load resources; tolerate absence and work with empties
        self.all_unique_symptoms: List[str] = self._load_pickle('all_unique_symptoms.pkl') or []
        self.disease_symptom_map: Dict[str, List[str]] = self._load_pickle('disease_symptom_map.pkl') or {}
        self.herb_symptom_map: Dict[str, List[str]] = self._load_pickle('herb_symptom_map.pkl') or {}
        self.post_info_map: Dict[str, Dict[str, Any]] = self._load_pickle('post_info_map.pkl') or {}
        # Build disease -> precautions from CSV
        precautions_csv = self.data_dir / 'df_precaution_cleaned.csv'
        self.disease_precautions: Dict[str, List[str]] = {}
        if precautions_csv.exists():
            with open(precautions_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                fieldnames = reader.fieldnames or []
                # Expect columns like: Disease, Precaution_1..Precaution_n or similar
                disease_col = None
                for cand in ['Disease', 'disease', 'Disease_Name', 'disease_name']:
                    if cand in fieldnames:
                        disease_col = cand
                        break
                if disease_col is None and len(fieldnames) > 0:
                    disease_col = fieldnames[0]
                precaution_cols = [c for c in fieldnames if c.lower().startswith('precaution')]
                if not precaution_cols:
                    # Fallback: any column except disease col
                    precaution_cols = [c for c in fieldnames if c != disease_col]
                for row in reader:
                    disease = str(row.get(disease_col, '')).strip()
                    vals = []
                    for pc in precaution_cols:
                        v = row.get(pc)
                        if v is not None:
                            v_str = str(v).strip()
                            if v_str and v_str.lower() != 'nan':
                                vals.append(v_str)
                    if disease:
                        self.disease_precautions[disease] = [v for v in vals if v]
        # Precompute disease->herbs mapping if herb map uses diseases
        # herb_symptom_map may map herb -> list of symptoms or diseases; we try both
        self.disease_to_herbs: Dict[str, List[str]] = {}
        for herb, items in self.herb_symptom_map.items():
            for it in items or []:
                # Collect under exact disease match; also build by symptom later if needed
                self.disease_to_herbs.setdefault(it, []).append(herb)

        # Normalize all text to lowercase for matching
        self.all_unique_symptoms = [s.lower() for s in self.all_unique_symptoms]
        self.disease_symptom_map = {k: [s.lower() for s in (v or [])] for k, v in self.disease_symptom_map.items()}
        self.disease_to_herbs = {k: sorted(set(v)) for k, v in self.disease_to_herbs.items()}
        # Normalize post symptoms to sets of lowercase strings
        norm_posts: Dict[str, Dict[str, Any]] = {}
        for pid, info in self.post_info_map.items():
            all_syms = info.get('All_Symptoms') or info.get('all_symptoms') or []
            if isinstance(all_syms, dict):
                # In case it's a set serialized oddly
                all_syms = list(all_syms)
            if isinstance(all_syms, (list, set, tuple)):
                sym_set = {str(s).strip().lower() for s in all_syms if str(s).strip()}
            else:
                sym_set = set()
            norm_posts[pid] = {
                **info,
                'All_Symptoms': sym_set,
            }
        self.post_info_map = norm_posts

        # Build document frequency for symptoms across diseases (for IDF weighting)
        self.total_diseases = max(1, len(self.disease_symptom_map))
        df: Dict[str, int] = {}
        for _d, syms in self.disease_symptom_map.items():
            for s in set(syms):
                df[s] = df.get(s, 0) + 1
        self.symptom_df = df

    def _idf(self, symptom: str) -> float:
        import math
        df = self.symptom_df.get(symptom, 0)
        return math.log((1 + self.total_diseases) / (1 + df) ) + 1.0

    # --- Public API ---
    def extract_symptoms(self, text: str, limit: int = 15, token_threshold: int = 85, phrase_threshold: int = 90) -> List[str]:
        tokens = _simple_tokenize(text)
        lemmas = [_lemmatize(t) for t in tokens]
        vocab = self.all_unique_symptoms
        if not vocab:
            return sorted(set(lemmas))[:limit]

        # Build bigrams/trigrams
        ngrams: List[str] = []
        for n in (3, 2):
            for i in range(0, max(0, len(lemmas) - n + 1)):
                ngrams.append(" ".join(lemmas[i:i+n]))

        matched: Dict[str, int] = {}
        # Phrase-first matching
        for phrase in ngrams:
            best = process.extractOne(phrase, vocab, scorer=fuzz.WRatio)
            if best and best[1] >= phrase_threshold:
                matched[best[0]] = max(matched.get(best[0], 0), best[1])
        # Token matching
        for tok in lemmas:
            best = process.extractOne(tok, vocab, scorer=fuzz.WRatio)
            if best and best[1] >= token_threshold:
                matched[best[0]] = max(matched.get(best[0], 0), best[1])
        # Return by match score desc
        return [s for s, _ in sorted(matched.items(), key=lambda x: x[1], reverse=True)][:limit]

    def predict_diseases(self, input_symptoms: List[str], top_k: int = 5) -> List[Dict[str, Any]]:
        # Fuzzy + IDF weighted scoring
        if not input_symptoms or not self.disease_symptom_map:
            return []
        results: List[Tuple[str, float]] = []
        for disease, d_syms in self.disease_symptom_map.items():
            if not d_syms:
                continue
            score = 0.0
            for s in input_symptoms:
                # Best fuzzy match score against this disease's symptoms
                best = process.extractOne(s, d_syms, scorer=fuzz.WRatio)
                if best:
                    raw = best[1] / 100.0
                    score += raw * self._idf(best[0])
            if score > 0:
                results.append((disease, score))
        results.sort(key=lambda x: x[1], reverse=True)
        # Normalize scores
        max_score = results[0][1] if results else 1.0
        out = [{"name": d, "score": (sc / max_score) if max_score else 0.0} for d, sc in results[:top_k]]
        return out

    def recommend_herbs(self, diseases: List[str], fallback_from_symptoms: List[str] = None, top_k: int = 10) -> List[Dict[str, Any]]:
        # Primary: herb_symptom_map is herb -> [symptoms]; score herbs by overlap/fuzzy with
        # (a) user symptoms and (b) union symptoms from top diseases.
        if not self.herb_symptom_map:
            return []
        diseases_lower = [d for d in diseases] if isinstance(diseases, list) else []
        # Union disease symptoms for context
        union_sym: List[str] = []
        for d in diseases_lower:
            union_sym.extend(self.disease_symptom_map.get(d, []))
        union_set = set(union_sym)
        user_set = set([s for s in (fallback_from_symptoms or [])])

        scored: List[Tuple[str, float, List[str]]] = []
        for herb, h_syms in self.herb_symptom_map.items():
            if not h_syms:
                continue
            # Exact overlaps first
            overlap_user = user_set.intersection(h_syms)
            overlap_union = union_set.intersection(h_syms)
            score = 0.0
            evidence: List[str] = []
            # Weight exact overlaps higher
            for s in overlap_user:
                score += 1.0 * self._idf(s)
                evidence.append(s)
            for s in overlap_union:
                if s not in overlap_user:
                    score += 0.6 * self._idf(s)
                    evidence.append(s)
            # Fuzzy bonus with user symptoms
            if fallback_from_symptoms:
                for s in fallback_from_symptoms:
                    best = process.extractOne(s, h_syms, scorer=fuzz.WRatio)
                    if best and best[1] >= 90:
                        score += 0.4 * (best[1] / 100.0)
                        if best[0] not in evidence:
                            evidence.append(best[0])
            if score > 0:
                scored.append((herb, score, evidence))
        scored.sort(key=lambda x: x[1], reverse=True)
        max_sc = scored[0][1] if scored else 1.0
        out = [{"name": h, "score": (sc / max_sc) if max_sc else 0.0, "matched_symptoms": evidence} for h, sc, evidence in scored[:top_k]]
        return out

    def retrieve_posts(self, input_symptoms: List[str], threshold: float = 0.1, top_k: int = 10) -> List[Dict[str, Any]]:
        # Jaccard similarity between input symptoms and post 'All_Symptoms'
        q = {str(s).strip().lower() for s in input_symptoms if str(s).strip()}
        if not q or not self.post_info_map:
            return []
        scored: List[Tuple[str, float]] = []
        for pid, info in self.post_info_map.items():
            ps: set = info.get('All_Symptoms', set()) or set()
            if not ps:
                continue
            inter = len(q & ps)
            union = len(q | ps)
            sim = (inter / union) if union else 0.0
            if sim >= threshold:
                scored.append((pid, sim))
        scored.sort(key=lambda x: x[1], reverse=True)
        out: List[Dict[str, Any]] = []
        for pid, sc in scored[:top_k]:
            inf = self.post_info_map.get(pid, {})
            out.append({
                'id': pid,
                'title': inf.get('title') or inf.get('Title') or 'Untitled',
                'diseases': inf.get('related_disease_id') or inf.get('diseases') or [],
                'herbs': inf.get('Herb') or inf.get('herbs') or [],
                'score': sc,
            })
        return out

    def get_precautions_grouped(self, diseases_with_scores: List[Dict[str, Any]], top_k_per_disease: int = 5, top_n_diseases: int = 3) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for item in diseases_with_scores[:top_n_diseases]:
            d = item.get("name")
            sc = item.get("score", 0.0)
            precs = self.disease_precautions.get(d, [])[:top_k_per_disease]
            out.append({"disease": d, "score": sc, "precautions": precs})
        return out
