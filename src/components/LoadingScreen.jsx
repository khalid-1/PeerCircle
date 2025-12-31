import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center transition-opacity duration-500">
            <div className="w-32 h-32">
                <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_p8bfn5to.json" background="transparent" speed="1" loop autoplay></lottie-player>
            </div>
            <h1 className="text-xl font-bold text-white mt-6 tracking-[0.2em] uppercase opacity-80 animate-pulse">PeerCircle</h1>
        </div>
    );
};

export default LoadingScreen;
