# African Disease Diagnosis System

A web-based disease diagnosis system that provides both modern medical predictions and traditional African natural remedies.

## Features

- Symptom-based disease prediction
- Integration with disease diagnosis APIs
- Database of traditional African remedies
- RESTful API endpoints
- Input validation and error handling

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git (optional)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd african-diagnosis-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the environment variables (see `.env.example`):
   ```env
   PORT=3000
   NODE_ENV=development
   # Add other environment variables as needed
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic reloading.

### Production Mode
```bash
npm start
```

## API Endpoints

### Get Diagnosis
- **URL**: `POST /api/diagnose`
- **Request Body**:
  ```json
  {
    "symptoms": ["fever", "headache", "cough"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "symptoms": ["fever", "headache", "cough"],
      "predictions": [
        {
          "disease": "Common Cold",
          "confidence": 0.85,
          "remedies": [
            {
              "name": "Garlic and Honey",
              "description": "A powerful combination for fighting infections and boosting immunity.",
              "preparation": "Crush garlic cloves and mix with raw honey. Let it sit for 24 hours.",
              "usage": "Take 1 teaspoon daily for prevention, 3 times daily when sick.",
              "warnings": "May cause bad breath and interact with blood thinners.",
              "origin": "Various African regions"
            }
          ]
        }
      ]
    }
  }
  ```

### Get Remedies for a Disease
- **URL**: `GET /api/remedies/:disease`
- **Example**: `GET /api/remedies/malaria`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "disease": "malaria",
      "remedies": [
        {
          "name": "Neem",
          "description": "Neem leaves have antibacterial and antiviral properties.",
          "preparation": "Boil neem leaves in water for 10 minutes, then strain.",
          "usage": "Drink the tea or use it as a skin wash.",
          "warnings": "Not recommended for pregnant women.",
          "origin": "East Africa"
        },
        {
          "name": "Bitter Leaf",
          "description": "Traditional remedy for fever, malaria, and digestive issues.",
          "preparation": "Wash leaves thoroughly and squeeze out the bitter juice.",
          "usage": "Drink small amounts or use in soups.",
          "warnings": "Extremely bitter taste.",
          "origin": "West Africa"
        }
      ]
    }
  }
  ```

## Project Structure

```
├── src/
│   ├── controllers/       # Route controllers
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── middleware/       # Custom middleware
│   ├── data/             # Data files (e.g., remedies.json)
│   └── index.js          # Application entry point
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Traditional African medicine practitioners
- Open-source community
- Modern web technologies
