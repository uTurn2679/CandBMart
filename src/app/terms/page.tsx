import React from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-brand-orange transition font-bold text-sm">
          <ChevronLeft size={16} />
          Back to Home
        </Link>
        <div className="font-black text-xl text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          C&B <span className="text-brand-orange">Mart</span>
        </div>
        <div className="w-[100px]" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-800 dark:text-zinc-100">Terms and Conditions</h1>
          </div>
          
          <div className="space-y-8 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">১. সাধারণ নিয়মাবলি (General Terms)</h2>
              <p>
                Grihokathon ওয়েবসাইট ব্যবহার বা এখান থেকে পণ্য ক্রয়ের মাধ্যমে আপনি আমাদের সব নিয়ম ও শর্তাবলিতে সম্মতি জানাচ্ছেন। আমরা যেকোনো সময় এই শর্তাবলি পরিবর্তন বা সংশোধন করার অধিকার রাখি, যা ওয়েবসাইটে প্রকাশের সাথে সাথে কার্যকর হবে।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">২. পণ্য ও মূল্য (Products and Pricing)</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>আমাদের ওয়েবসাইটে প্রদর্শিত সব পণ্যের মূল্য বাংলাদেশি টাকা (BDT) তে দেওয়া আছে।</li>
                <li>আমরা পণ্যের সঠিক ছবি ও বিবরণ দেওয়ার সর্বোচ্চ চেষ্টা করি, তবে আপনার ডিভাইসের স্ক্রিনের কারণে পণ্যের আসল রঙের সামান্য তারতম্য হতে পারে।</li>
                <li>যেকোনো সময় কোনো নোটিশ ছাড়াই পণ্যের মূল্য পরিবর্তন করার অধিকার Grihokathon সংরক্ষণ করে।</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">৩. অর্ডার ও ডেলিভারি (Order and Delivery)</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>অর্ডার কনফার্ম হওয়ার পর ঢাকার ভেতরে ২-৩ দিন এবং ঢাকার বাইরে ৩-৫ কর্মদিবসের মধ্যে পণ্য ডেলিভারি করা হয়।</li>
                <li>অনিবার্য কারণবশত (যেমন: প্রাকৃতিক দুর্যোগ, ধর্মঘট ইত্যাদি) ডেলিভারি সময় কিছুটা বিলম্বিত হতে পারে।</li>
                <li>ডেলিভারি ম্যান থাকা অবস্থায় পণ্য চেক করে নেওয়ার অনুরোধ করা হলো। পরবর্তীতে কোনো ভাঙা বা ড্যামেজ পণ্যের অভিযোগ গ্রহণযোগ্য হবে না।</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">৪. রিটার্ন ও রিফান্ড পলিসি (Return and Refund Policy)</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>ভুল পণ্য বা ড্যামেজ পণ্য পেলে ডেলিভারি ম্যান থাকা অবস্থায়ই আমাদের জানাতে হবে এবং পণ্যটি রিটার্ন করতে হবে।</li>
                <li>ব্যবহার করা হয়েছে এমন বা ধোয়া হয়েছে এমন কোনো পণ্য (যেমন পর্দা বা বেডশিট) পরিবর্তন বা ফেরত নেওয়া হবে না।</li>
                <li>রিফান্ডের ক্ষেত্রে পণ্যটি আমাদের হাতে পৌঁছানোর পর ৩-৫ কর্মদিবসের মধ্যে আপনার প্রদত্ত মাধ্যমে টাকা ফেরত দেওয়া হবে।</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">৫. প্রাইভেসি পলিসি (Privacy Policy)</h2>
              <p>
                আপনার দেওয়া সব ব্যক্তিগত তথ্য (যেমন: নাম, ফোন নম্বর, ঠিকানা) সম্পূর্ণ সুরক্ষিত। আমরা এই তথ্য শুধুমাত্র আপনার অর্ডার ডেলিভারি এবং আমাদের সেবার মান উন্নয়নের জন্য ব্যবহার করে থাকি। কোনো থার্ড পার্টির কাছে আপনার তথ্য শেয়ার করা হয় না।
              </p>
            </section>
            
            <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-sm">
                যোগাযোগ: যেকোনো প্রয়োজনে আমাদের ইমেইল করুন <a href="mailto:grihokathon@gmail.com" className="font-bold text-brand-orange hover:underline">grihokathon@gmail.com</a> এ অথবা কল করুন <a href="tel:01804914606" className="font-bold text-brand-orange hover:underline">01804-914606</a> নম্বরে।
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs font-bold text-zinc-500">
        © 2026 Grihokathon. All rights reserved.
      </footer>
    </div>
  );
}
