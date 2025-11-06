import { Link } from 'react-router-dom';
import { Brain, Shield, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Student Stress Monitor</span>
          </div>
          <nav className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Mental Health Assessment for Students
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Monitor your stress levels, get personalized recommendations, and take control of your mental wellbeing with our advanced machine learning system.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Start Free Assessment <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-secondary text-lg px-8 py-3">
              Learn More
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">85%+</div>
            <div className="text-gray-600">Prediction Accuracy</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">20+</div>
            <div className="text-gray-600">Analyzed Factors</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-gray-600">Available Support</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card hover:shadow-xl transition-shadow">
              <Brain className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Prediction</h3>
              <p className="text-gray-600">
                Advanced Random Forest algorithm analyzes 20+ factors to predict stress levels with high accuracy.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <TrendingUp className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your stress trends over time with interactive charts and historical data analysis.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <Shield className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-600">
                Your data is encrypted and secure. We follow FERPA guidelines for student privacy protection.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <Users className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personalized Care</h3>
              <p className="text-gray-600">
                Receive customized recommendations and coping strategies based on your unique stress factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Complete Assessment</h3>
                <p className="text-gray-600">
                  Answer questions about your lifestyle, mental health, and academic factors. Takes 5-10 minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Get AI Analysis</h3>
                <p className="text-gray-600">
                  Our machine learning model analyzes your responses and predicts your stress risk level with confidence scores.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Receive Recommendations</h3>
                <p className="text-gray-600">
                  Get personalized coping strategies, resources, and action plans tailored to your specific stress factors.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Track & Improve</h3>
                <p className="text-gray-600">
                  Monitor your progress over time and see how interventions impact your mental wellbeing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Take Control of Your Mental Health?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students using our platform for early intervention and stress management.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-primary-400" />
            <span className="text-xl font-bold text-white">Student Stress Monitor</span>
          </div>
          <p className="mb-4">AI-powered mental health assessment for students</p>
          <p className="text-sm text-gray-400">
            &copy; 2024 Student Stress Monitor. All rights reserved.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>National Suicide Prevention Lifeline: 988</p>
            <p>Crisis Text Line: Text HOME to 741741</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
