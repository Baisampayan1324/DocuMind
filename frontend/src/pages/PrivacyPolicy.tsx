import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <h1 className="text-5xl font-bold text-primary mb-6 tracking-tight">Privacy Policy</h1>
            <p className="text-xl text-on-surface-variant leading-relaxed">
              Your privacy is our top priority. We are committed to being transparent about how we handle your data.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-primary mb-2">Secure Storage</h4>
              <p className="text-sm text-on-surface-variant">All documents are encrypted at rest and in transit.</p>
            </div>
            <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-primary mb-2">Access Control</h4>
              <p className="text-sm text-on-surface-variant">Only you can access your uploaded documents and chats.</p>
            </div>
            <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-primary mb-2">Transparency</h4>
              <p className="text-sm text-on-surface-variant">We never sell your data to third parties.</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert max-w-none text-on-surface-variant space-y-8"
          >
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6" /> 1. Data Collection
              </h2>
              <p className="leading-relaxed">
                We collect information that you provide directly to us, such as when you upload documents or interact with our AI. This includes the content of your documents and any preferences you set.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6" /> 2. How We Use Your Data
              </h2>
              <p className="leading-relaxed">
                Your data is used solely to provide and improve our services. This includes processing your documents to generate insights, providing customer support, and sending you important updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6" /> 3. Data Retention
              </h2>
              <p className="leading-relaxed">
                We retain your information for as long as needed to provide you services. You can delete your documents at any time through your settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6" /> 4. Third-Party Services
              </h2>
              <p className="leading-relaxed">
                We use trusted third-party services to process payments and provide AI capabilities. These services are required to maintain the same level of data protection as we do.
              </p>
            </section>

            <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 mt-12">
              <p className="text-sm italic">
                Last updated: March 20, 2026. If you have any questions about this policy, please contact our support team.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
