import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white py-8 mt-auto hidden md:block">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold mb-1">PeerCircle</h3>
                    <p className="text-slate-400 text-sm">A Wellbeing Platform for Nursing Student.</p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2">
                    <p className="text-slate-500 text-xs">© 2025 PeerCircle. Created by <span className="font-bold text-slate-300">Khalid Said</span>.</p>
                    <div className="flex space-x-4">
                        <a href="#" className="text-slate-400 hover:text-teal-500 transition"><i className="fab fa-instagram text-xl"></i></a>
                        <a href="#" className="text-slate-400 hover:text-teal-500 transition"><i className="fab fa-github text-xl"></i></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
