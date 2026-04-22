import React from 'react';

export default function StatisticsDevPage() {
    return (
        <div className="bg-[url('https://res.cloudinary.com/dalaaegob/image/upload/v1769788980/8_ulba1f.png'),linear-gradient(#ededed,#ededed)] bg-cover w-full rounded-lg h-full pt-32 pb-12 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 opacity-90">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-6 uppercase tracking-wide border-b pb-4">
                        IELTS System Statistics
                    </h2>
                    
                    <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Statistics Coming Soon</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                This page is currently under development. Detailed statistics will be displayed here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
