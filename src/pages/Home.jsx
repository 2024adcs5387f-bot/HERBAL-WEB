import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Package,
  Brain,
  Search,
  Shield,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Award,
  Globe
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Leaf,
      title: 'Plant Scanner',
      description: 'Identify plants instantly with AI-powered image recognition',
      href: '/plant-scanner',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Brain,
      title: 'Chatbot',
      description: 'Describe symptoms to get likely conditions and herbal guidance',
      href: '/chatbot',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Package,
      title: 'Product Marketplace',
      description: 'Browse curated herbal products from verified sellers',
      href: '/products',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Search,
      title: 'Research Hub',
      description: 'Explore herbal studies and community knowledge',
      href: '/research-hub',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Products Available', icon: Package },
    { number: '5K+', label: 'Happy Customers', icon: Users },
    { number: '100+', label: 'Verified Sellers', icon: Shield },
    { number: '4.9', label: 'Customer Rating', icon: Star }
  ];

  const benefits = [
    'AI-powered plant identification',
    'Expert herbalist consultations',
    'Secure payment processing',
    'Quality verified products',
    'Fast shipping worldwide',
    '30-day money-back guarantee'
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Wellness Enthusiast',
      content: 'The plant scanner helped me identify herbs in my garden. The recommendations are spot-on!',
      rating: 5,
      avatar: null
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Herbalist',
      content: 'As a professional herbalist, I appreciate the quality and authenticity of products here.',
      rating: 5,
      avatar: null
    },
    {
      name: 'Emma Rodriguez',
      role: 'Health Coach',
      content: 'The symptom checker provides valuable insights. Great platform for natural wellness.',
      rating: 5,
      avatar: null
    }
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 home-wheat"
      style={{
        paddingTop: '0px',
        backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://i.pinimg.com/1200x/07/93/2a/07932ab86b0b6c0f7197db770c74f139.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Hero Section */}
      <section className="relative pb-20 overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left text-white"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#F5DEB3', paddingTop:50}}>
                <span style={{ color: '#F5DEB3' }}>
                  Natural Wellness
                </span>
                <br />

                <span style={{ color: '#F5DEB3' }}>Meets Modern AI</span>
              </h1>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#F5DEB3' }}>
                Discover the power of herbal medicine enhanced by artificial intelligence.

                Identify plants, check symptoms, and get personalized recommendations for your wellness journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="btn btn-primary btn-lg inline-flex items-center"
                >
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/plant-scanner"
                  className="btn btn-outline btn-lg inline-flex items-center"
                >
                  Try Plant Scanner
                  <Leaf className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="w-full h-96 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <Leaf className="h-24 w-24 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#F5DEB3' }}>AI Plant Scanner</h3>
                    <p style={{ color: '#F5DEB3' }}>Upload a photo to identify plants</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section><br/>

      {/* Stats Section */}
      <section className="py-16 dark:bg-neutral-800" style={{ backgroundColor:'rgb(8, 167, 69)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-sm text-primary-200">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need for Natural Wellness
            </h2>

            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              Our platform combines traditional herbal wisdom with cutting-edge AI technology

              to provide you with the most comprehensive natural health solution.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link to={feature.href} className="block">
                    <div className=" dark:bg-neutral-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border border-neutral-200 dark:border-neutral-700" style={{ backgroundColor:'rgb(8, 167, 69)' }}>
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-100 transition-colors duration-300">

                        {feature.title}
                      </h3>
                      <p className="text-white leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section><br/>

      {/* Benefits Section */}
      <section className="py-20  dark:bg-neutral-800"  style={{ backgroundColor:'rgb(7, 145, 60)' }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Benefits Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Why Choose HerbalMarket?
              </h2>

              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">
                We're committed to providing you with the highest quality herbal products

                and AI-powered tools to support your natural wellness journey.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <span className="text-white">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Benefits Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="dark:bg-neutral-800 rounded-2xl p-6 shadow-lg" style={{ backgroundColor:'rgb(8, 167, 69)' }}>
                    <TrendingUp className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">Growing Community</h3>
                    <p className="text-sm text-primary-200">Join thousands of wellness enthusiasts</p>
                  </div>
                  <div className="dark:bg-neutral-800 rounded-2xl p-6 shadow-lg" style={{ backgroundColor:'rgb(8, 167, 69)' }}>
                    <Award className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">Quality Assured</h3>
                    <p className="text-sm text-primary-200">All products verified and tested</p>
                  </div>
                  <div className="dark:bg-neutral-800 rounded-2xl p-6 shadow-lg" style={{ backgroundColor:'rgb(8, 167, 69)' }}>
                    <Globe className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">Global Reach</h3>
                    <p className="text-sm text-primary-200">Shipping to 50+ countries</p>
                  </div>
                  <div className="dark:bg-neutral-800 rounded-2xl p-6 shadow-lg" style={{ backgroundColor:'rgb(8, 167, 69)' }}>
                    <Shield className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">Secure Platform</h3>
                    <p className="text-sm text-primary-200">Your data is safe with us</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section><br/>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust HerbalMarket for their natural wellness needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className=" dark:bg-neutral-800 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700" style={{ backgroundColor:'rgb(8, 167, 69)' }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar ? (
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      testimonial.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-primary-200">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section><br/>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-wheat">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-wheat">
              Join thousands of people who are already experiencing the benefits of
              AI-powered herbal medicine and natural wellness solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-success text-primary-600 hover:bg-neutral-100 btn-lg inline-flex items-center"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/products"
                className="btn btn-outline border-[rgb(8, 167, 69)] text-success hover:bg-success hover:text-primary-600 btn-lg inline-flex items-center"
              >
                Browse Products
                <Package className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section><br /><br />
    </div>
  );
};

export default Home;
