import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { assessmentAPI } from '@/services/api';
import type { AssessmentData } from '@/types';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUESTIONS = [
  { id: 'anxiety_level', label: 'Anxiety Level', description: 'Rate your anxiety level (0-30)', min: 0, max: 30 },
  { id: 'self_esteem', label: 'Self Esteem', description: 'Rate your self-esteem (0-30)', min: 0, max: 30 },
  { id: 'mental_health_history', label: 'Mental Health History', description: 'Do you have a history of mental health issues? (0=No, 1=Yes)', min: 0, max: 1 },
  { id: 'depression', label: 'Depression Level', description: 'Rate your depression level (0-30)', min: 0, max: 30 },
  { id: 'headache', label: 'Headache Frequency', description: 'How often do you experience headaches? (0-5)', min: 0, max: 5 },
  { id: 'blood_pressure', label: 'Blood Pressure', description: 'Blood pressure level (1-3: Normal/High/Very High)', min: 1, max: 3 },
  { id: 'sleep_quality', label: 'Sleep Quality', description: 'Rate your sleep quality (0-5, higher is better)', min: 0, max: 5 },
  { id: 'breathing_problem', label: 'Breathing Problems', description: 'Do you experience breathing problems? (0-5)', min: 0, max: 5 },
  { id: 'noise_level', label: 'Noise Level', description: 'Environmental noise level affecting you (0-5)', min: 0, max: 5 },
  { id: 'living_conditions', label: 'Living Conditions', description: 'Rate your living conditions (1-5, higher is better)', min: 1, max: 5 },
  { id: 'safety', label: 'Safety', description: 'How safe do you feel? (1-5, higher is safer)', min: 1, max: 5 },
  { id: 'basic_needs', label: 'Basic Needs', description: 'Are your basic needs met? (1-5, higher is better)', min: 1, max: 5 },
  { id: 'academic_performance', label: 'Academic Performance', description: 'Rate your academic performance (1-5, higher is better)', min: 1, max: 5 },
  { id: 'study_load', label: 'Study Load', description: 'How heavy is your study load? (1-5, higher is heavier)', min: 1, max: 5 },
  { id: 'teacher_student_relationship', label: 'Teacher-Student Relationship', description: 'Rate your relationship with teachers (1-5, higher is better)', min: 1, max: 5 },
  { id: 'future_career_concerns', label: 'Future Career Concerns', description: 'How concerned are you about your future career? (1-5)', min: 1, max: 5 },
  { id: 'social_support', label: 'Social Support', description: 'Rate your social support system (1-5, higher is better)', min: 1, max: 5 },
  { id: 'peer_pressure', label: 'Peer Pressure', description: 'How much peer pressure do you experience? (1-5)', min: 1, max: 5 },
  { id: 'extracurricular_activities', label: 'Extracurricular Activities', description: 'Level of extracurricular involvement (0-5)', min: 0, max: 5 },
  { id: 'bullying', label: 'Bullying', description: 'Do you experience bullying? (1-5)', min: 1, max: 5 },
];

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<AssessmentData>();

  const onSubmit = async (data: AssessmentData) => {
    setIsSubmitting(true);
    try {
      // Convert all values to numbers
      const numericData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, Number(value)])
      ) as unknown as AssessmentData;

      const response = await assessmentAPI.submit(numericData);
      toast.success('Assessment submitted successfully!');
      navigate(`/results/${response.assessment.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="card">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Stress Assessment</h1>
            <p className="text-gray-600">
              Please answer all questions honestly. This assessment analyzes 20 different factors to predict your stress level and provide personalized recommendations.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Privacy Note:</strong> Your responses are confidential and encrypted. This assessment takes approximately 5-10 minutes to complete.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {QUESTIONS.map((question, index) => (
              <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-500">Question {index + 1} of {QUESTIONS.length}</span>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{question.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{question.description}</div>
                </label>

                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="range"
                    min={question.min}
                    max={question.max}
                    step={1}
                    defaultValue={Math.floor((question.min + question.max) / 2)}
                    {...register(question.id as keyof AssessmentData, {
                      required: 'This field is required',
                      min: { value: question.min, message: `Minimum value is ${question.min}` },
                      max: { value: question.max, message: `Maximum value is ${question.max}` }
                    })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    onChange={(e) => {
                      const output = e.target.parentElement?.querySelector('.value-display');
                      if (output) output.textContent = e.target.value;
                    }}
                  />
                  <span className="value-display w-12 text-center font-semibold text-primary-600 text-lg">
                    {Math.floor((question.min + question.max) / 2)}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{question.min}</span>
                  <span>{question.max}</span>
                </div>

                {errors[question.id as keyof AssessmentData] && (
                  <p className="text-red-600 text-sm mt-2">
                    {errors[question.id as keyof AssessmentData]?.message}
                  </p>
                )}
              </div>
            ))}

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full text-lg py-3 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Assessment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Crisis Resources */}
        <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2">Crisis Resources</h3>
          <p className="text-red-800 text-sm mb-3">
            If you're experiencing a mental health crisis, please reach out immediately:
          </p>
          <ul className="text-red-800 text-sm space-y-1">
            <li><strong>National Suicide Prevention Lifeline:</strong> 988</li>
            <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
            <li><strong>Campus Counseling:</strong> Contact your student health center</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
