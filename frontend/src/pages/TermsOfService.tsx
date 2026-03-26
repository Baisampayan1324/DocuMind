import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { FileText, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-primary mb-6 tracking-tight">Terms of Service</h1>
            <p className="text-xl text-on-surface-variant leading-relaxed">
              Please read these terms carefully before using our services.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-primary mb-4">Acceptance</h4>
              <p className="text-on-surface-variant leading-relaxed">
                By accessing or using DocuMind, you agree to be bound by these terms. If you do not agree, you may not use our services.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-primary mb-4">Restrictions</h4>
              <p className="text-on-surface-variant leading-relaxed">
                You may not use our services for any illegal activities or to upload content that violates the rights of others.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert max-w-none text-on-surface-variant space-y-10"
          >
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6" /> 1. Use of Services
              </h2>
              <p className="leading-relaxed">
                DocuMind provides AI-driven document analysis. You are responsible for all activities that occur during your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6" /> 2. User Content
              </h2>
              <p className="leading-relaxed">
                You retain all rights to the documents you upload. By uploading content, you grant us a license to process it solely for providing the services you've requested.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6" /> 3. Intellectual Property
              </h2>
              <p className="leading-relaxed">
                The DocuMind platform, including its software, design, and AI models, is protected by intellectual property laws. You may not copy, modify, or reverse-engineer any part of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6" /> 4. Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                DocuMind is provided "as is" without any warranties. We are not liable for any damages arising from your use of the platform or any inaccuracies in the AI-generated insights.
              </p>
            </section>

            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 mt-12 flex items-start gap-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary mb-2">Questions?</h4>
                <p className="text-on-surface-variant leading-relaxed">
                  If you have any questions about these terms, please reach out to our legal team at legal@documind.ai.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
