/**
 * Application Form Component
 *
 * Multi-step membership application form.
 * Features:
 * - Progress saving with resume token
 * - Email verification
 * - Membership type selection
 * - Background check acknowledgment
 * - Real-time client-side validation
 *
 * @see features.md Section 2.1 for requirements
 */

import { useState } from 'react';
import { useFormValidation, type FormConfig } from '../hooks/useFormValidation';
import { email, phone, minLength } from '../lib/validation';
import { FormInput, FormSelect, FormCheckbox, FormRow } from './ui/FormInput';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

type Step = 'info' | 'membership' | 'acknowledgments' | 'review';

type InfoFields = 'firstName' | 'lastName' | 'email' | 'phone' | 'howHeardAboutUs';

const infoFormConfig: FormConfig<InfoFields> = {
  firstName: {
    required: true,
    requiredMessage: 'First name is required',
    validators: [minLength(2, 'First name must be at least 2 characters')],
  },
  lastName: {
    required: true,
    requiredMessage: 'Last name is required',
    validators: [minLength(2, 'Last name must be at least 2 characters')],
  },
  email: {
    required: true,
    requiredMessage: 'Email is required',
    validators: [email('Please enter a valid email address')],
  },
  phone: {
    required: true,
    requiredMessage: 'Phone number is required',
    validators: [phone('Please enter a valid phone number')],
  },
  howHeardAboutUs: {
    required: false,
  },
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: 'individual' | 'family' | 'life';
  howHeardAboutUs: string;
  agreeToRules: boolean;
  agreeToBackgroundCheck: boolean;
  agreeToTerms: boolean;
}

const membershipPrices = {
  individual: 150,
  family: 200,
  life: 1500,
};

const howHeardOptions = [
  { value: '', label: 'Select an option...', disabled: true },
  { value: 'member_referral', label: 'Member Referral' },
  { value: 'web_search', label: 'Web Search' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'event', label: 'Attended an Event' },
  { value: 'drive_by', label: 'Drove By' },
  { value: 'other', label: 'Other' },
];

export default function ApplicationForm() {
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [resumeToken, setResumeToken] = useState<string | null>(null);

  // Use validation hook for personal info fields
  const infoForm = useFormValidation<InfoFields>(infoFormConfig);

  // Non-validated form state
  const [membershipType, setMembershipType] = useState<'individual' | 'family' | 'life'>('individual');
  const [agreeToRules, setAgreeToRules] = useState(false);
  const [agreeToBackgroundCheck, setAgreeToBackgroundCheck] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Combine form data for submission and review
  const formData: FormData = {
    firstName: infoForm.values.firstName,
    lastName: infoForm.values.lastName,
    email: infoForm.values.email,
    phone: infoForm.values.phone,
    howHeardAboutUs: infoForm.values.howHeardAboutUs,
    membershipType,
    agreeToRules,
    agreeToBackgroundCheck,
    agreeToTerms,
  };

  const handleStartApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form first
    if (!infoForm.validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          membershipType: formData.membershipType,
          howHeardAboutUs: formData.howHeardAboutUs || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to start application');
      }

      const data = await res.json();
      setApplicationId(data.id);
      setResumeToken(data.resumeToken);
      setStep('membership');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!formData.agreeToRules || !formData.agreeToBackgroundCheck || !formData.agreeToTerms) {
      setError('Please agree to all acknowledgments');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would redirect to Stripe for payment
      // For now, we'll just show a success message
      alert(
        'Application submitted! In production, you would be redirected to payment. ' +
          `Your resume token: ${resumeToken}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'info', label: 'Your Info', number: 1 },
    { id: 'membership', label: 'Membership', number: 2 },
    { id: 'acknowledgments', label: 'Agreements', number: 3 },
    { id: 'review', label: 'Review', number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((s, index) => (
          <div key={s.id} className="flex-1 flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index <= currentStepIndex
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s.number}
            </div>
            <span
              className={`hidden sm:block ml-2 text-sm ${
                index <= currentStepIndex ? 'text-green-700 font-medium' : 'text-gray-500'
              }`}
            >
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  index < currentStepIndex ? 'bg-green-700' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Personal Info */}
      {step === 'info' && (
        <form onSubmit={handleStartApplication} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

          <FormRow columns={2}>
            <FormInput
              label="First Name"
              {...infoForm.getFieldProps('firstName')}
              error={infoForm.touched.firstName ? infoForm.errors.firstName : null}
              required
            />
            <FormInput
              label="Last Name"
              {...infoForm.getFieldProps('lastName')}
              error={infoForm.touched.lastName ? infoForm.errors.lastName : null}
              required
            />
          </FormRow>

          <FormInput
            label="Email Address"
            type="email"
            {...infoForm.getFieldProps('email')}
            error={infoForm.touched.email ? infoForm.errors.email : null}
            helpText="We'll send a link to resume your application if needed"
            required
          />

          <FormInput
            label="Phone Number"
            type="tel"
            {...infoForm.getFieldProps('phone')}
            error={infoForm.touched.phone ? infoForm.errors.phone : null}
            formatAs="phone"
            placeholder="(512) 555-1234"
            required
          />

          <FormSelect
            label="How did you hear about us?"
            name="howHeardAboutUs"
            value={infoForm.values.howHeardAboutUs}
            onChange={infoForm.handleChange('howHeardAboutUs')}
            onBlur={infoForm.handleBlur('howHeardAboutUs')}
            options={howHeardOptions}
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Starting Application...' : 'Continue'}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Membership Type */}
      {step === 'membership' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Select Membership Type</h2>

          <div className="space-y-3">
            {[
              {
                type: 'individual' as const,
                name: 'Individual',
                price: '$150/year',
                description: 'Full membership for a single adult.',
              },
              {
                type: 'family' as const,
                name: 'Family',
                price: '$200/year',
                description: 'Includes spouse and dependents under 21.',
                popular: true,
              },
              {
                type: 'life' as const,
                name: 'Life Member',
                price: '$1,500 one-time',
                description: 'Lifetime membership with no annual dues.',
              },
            ].map((option) => (
              <label
                key={option.type}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  membershipType === option.type
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="membershipType"
                  value={option.type}
                  checked={membershipType === option.type}
                  onChange={(e) => setMembershipType(e.target.value as FormData['membershipType'])}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.name}</span>
                    {option.popular && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                <span className="font-semibold text-green-700">{option.price}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep('info')}
              className="flex-1 border border-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('acknowledgments')}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Acknowledgments */}
      {step === 'acknowledgments' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Agreements & Acknowledgments</h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={agreeToRules}
                onChange={(e) => setAgreeToRules(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <p className="font-medium">Range Rules Agreement</p>
                <p className="text-sm text-gray-600">
                  I have read and agree to abide by all{' '}
                  <a href="/range-rules" target="_blank" className="text-green-700 underline">
                    Austin Rifle Club range rules
                  </a>
                  . I understand that violation of these rules may result in suspension or
                  termination of membership.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={agreeToBackgroundCheck}
                onChange={(e) => setAgreeToBackgroundCheck(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <p className="font-medium">Background Check Consent</p>
                <p className="text-sm text-gray-600">
                  I consent to a background check as part of the membership application process. I
                  certify that I am not prohibited by law from possessing firearms and have no
                  felony convictions.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <p className="font-medium">Terms & Liability Waiver</p>
                <p className="text-sm text-gray-600">
                  I have read and agree to the{' '}
                  <a href="/terms" target="_blank" className="text-green-700 underline">
                    terms of membership
                  </a>{' '}
                  and{' '}
                  <a href="/waiver" target="_blank" className="text-green-700 underline">
                    liability waiver
                  </a>
                  . I understand that shooting sports involve inherent risks and I voluntarily
                  assume those risks.
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep('membership')}
              className="flex-1 border border-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('review')}
              disabled={!agreeToRules || !agreeToBackgroundCheck || !agreeToTerms}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 'review' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Review Your Application</h2>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2">Personal Information</h3>
              <p className="font-medium">
                {formData.firstName} {formData.lastName}
              </p>
              <p className="text-gray-600">{formData.email}</p>
              <p className="text-gray-600">{formData.phone}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2">Membership Type</h3>
              <p className="font-medium capitalize">{formData.membershipType}</p>
              <p className="text-green-700 font-semibold">
                ${membershipPrices[formData.membershipType]}
                {formData.membershipType !== 'life' && '/year'}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>Next Steps:</strong> After submitting, you'll be redirected to complete
                payment. Once payment is received, your application will be reviewed (typically 5-7
                business days). You'll receive an email with instructions to complete your new
                member orientation.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep('acknowledgments')}
              className="flex-1 border border-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmitApplication}
              disabled={loading}
              className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Submit & Pay $${membershipPrices[formData.membershipType]}`}
            </button>
          </div>
        </div>
      )}

      {/* Resume Application Link */}
      {resumeToken && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="text-blue-800">
            <strong>Save for later:</strong> A link to resume this application has been sent to{' '}
            {formData.email}. You can also bookmark this page.
          </p>
        </div>
      )}
    </div>
  );
}
