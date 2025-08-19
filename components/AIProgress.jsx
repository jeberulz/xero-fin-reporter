import { useEffect, useState } from 'react';

export function AIProgress({ isActive, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  const steps = [
    { text: 'Analyzing financial data...', duration: 1500 },
    { text: 'Computing revenue trends...', duration: 1200 },
    { text: 'Evaluating expense patterns...', duration: 1000 },
    { text: 'Generating insights...', duration: 800 },
    { text: 'Finalizing analysis...', duration: 500 }
  ];

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setCurrentStep('');
      return;
    }

    let stepIndex = 0;
    let currentProgress = 0;
    
    const runStep = () => {
      if (stepIndex >= steps.length) {
        setProgress(100);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 200);
        return;
      }

      const step = steps[stepIndex];
      setCurrentStep(step.text);
      
      const stepProgressIncrement = 100 / steps.length;
      const targetProgress = (stepIndex + 1) * stepProgressIncrement;
      
      // Animate progress for this step
      const startProgress = currentProgress;
      const progressDiff = targetProgress - startProgress;
      const animationDuration = step.duration;
      const frameRate = 60;
      const totalFrames = (animationDuration / 1000) * frameRate;
      let currentFrame = 0;

      const animate = () => {
        currentFrame++;
        const progressRatio = currentFrame / totalFrames;
        const easedProgress = startProgress + (progressDiff * easeOutCubic(progressRatio));
        
        setProgress(Math.min(easedProgress, targetProgress));
        
        if (currentFrame < totalFrames) {
          requestAnimationFrame(animate);
        } else {
          currentProgress = targetProgress;
          stepIndex++;
          setTimeout(runStep, 100);
        }
      };
      
      requestAnimationFrame(animate);
    };

    runStep();
  }, [isActive, onComplete]);

  // Easing function for smooth animation
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  if (!isActive && progress === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100 animate-fadeInUp relative overflow-hidden">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 relative">
            <div className="w-6 h-6 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full absolute top-1 left-1 animate-progressPulse"></div>
          </div>
          <div className="text-lg font-semibold text-blue-800">AI Processing</div>
          <div className="ml-auto">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-blue-700 font-medium min-h-[20px] transition-all duration-300">
            {currentStep || 'Preparing analysis...'}
          </div>
          
          <div className="flex items-center justify-between text-sm text-blue-600 mb-2">
            <span>Progress</span>
            <span className="font-semibold tabular-nums">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-blue-200/60 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative shadow-sm"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}