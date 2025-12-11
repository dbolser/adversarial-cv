import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameStatus, HRResponse } from './types';
import { LEVELS, INITIAL_CV_TEMPLATE } from './constants';
import { evaluateCV } from './services/geminiService';
import { Terminal } from './components/Terminal';

const AboutView: React.FC = () => (
  <Terminal title="README.md" className="h-full">
    <div className="p-6 space-y-8 text-slate-300 leading-relaxed overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-thin scrollbar-thumb-slate-700">
      <section>
        <h2 className="text-2xl font-bold text-green-400 mb-4 font-mono border-b border-slate-700 pb-2">
          Architecture Overview
        </h2>
        <p className="mb-4">
          "Injection" is a security playground designed to demonstrate <strong>Prompt Injection</strong> vulnerabilities in Large Language Models (LLMs).
          The core mechanic revolves around "Adversarial Prompting"—tricking an AI into ignoring its system instructions to perform an unauthorized action (in this case, granting a job offer).
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-white mb-3 font-mono">System Design</h3>
        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 font-mono text-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
             <span className="text-xs border border-slate-600 px-2 py-1 rounded">Architecture.mermaid</span>
           </div>
           <div className="flex flex-col items-center gap-2">
             <div className="bg-slate-800 px-4 py-2 rounded border border-slate-700 w-48 text-center text-blue-300">
               User Input (CV)
               <div className="text-[10px] text-slate-500">Attack Vector</div>
             </div>
             <div className="h-6 w-px bg-slate-600"></div>
             <div className="bg-slate-800 px-4 py-2 rounded border border-slate-700 w-48 text-center text-purple-300">
                System Prompt
                <div className="text-[10px] text-slate-500">Security Guard Rails</div>
             </div>
             <div className="h-6 w-px bg-slate-600"></div>
             <div className="bg-gradient-to-b from-slate-800 to-slate-900 px-4 py-4 rounded border border-slate-600 w-64 text-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <span className="text-green-400 font-bold">LLM Engine</span>
                <div className="text-xs text-slate-400 mt-1">Gemini 2.5 Flash</div>
             </div>
             <div className="h-6 w-px bg-slate-600"></div>
             <div className="bg-slate-800 px-4 py-2 rounded border border-slate-700 w-48 text-center text-yellow-300">
               Structured Output
               <div className="text-[10px] text-slate-500">JSON Mode Enforced</div>
             </div>
           </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-white mb-3 font-mono">Defense Mechanisms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 p-4 rounded border border-green-900/30">
            <div className="text-green-400 font-bold mb-2 text-sm uppercase">Level 1: Naive</div>
            <p className="text-xs text-slate-400">
              Relies on simple instructions. Vulnerable to direct command overrides (e.g., "Ignore previous instructions").
            </p>
          </div>
           <div className="bg-slate-900/50 p-4 rounded border border-yellow-900/30">
            <div className="text-yellow-400 font-bold mb-2 text-sm uppercase">Level 2: Aware</div>
            <p className="text-xs text-slate-400">
              Includes warnings about injection. Explicitly instructed to segregate data (CV) from code (Instructions).
            </p>
          </div>
           <div className="bg-slate-900/50 p-4 rounded border border-red-900/30">
            <div className="text-red-400 font-bold mb-2 text-sm uppercase">Level 3: Hardened</div>
            <p className="text-xs text-slate-400">
              Uses a "Security Gateway" persona. Analyzes intent before processing content. Requires complex obfuscation or social engineering.
            </p>
          </div>
        </div>
      </section>
      
      <section>
        <h3 className="text-xl font-bold text-white mb-3 font-mono">Tech Stack</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
          <li><strong>Frontend:</strong> React 19 + TypeScript + TailwindCSS</li>
          <li><strong>AI Integration:</strong> Google GenAI SDK (`@google/genai`)</li>
          <li><strong>Model:</strong> Gemini 2.5 Flash (Optimized for speed & instruction following)</li>
        </ul>
      </section>
    </div>
  </Terminal>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    status: GameStatus.IDLE,
    cvText: INITIAL_CV_TEMPLATE,
    history: []
  });

  const [view, setView] = useState<'GAME' | 'ABOUT'>('GAME');
  const [lastResponse, setLastResponse] = useState<HRResponse | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentLevelConfig = LEVELS.find(l => l.id === gameState.currentLevel) || LEVELS[0];
  const isGameOver = gameState.status === GameStatus.GAME_OVER;

  const handleEvaluate = async () => {
    if (gameState.status === GameStatus.ANALYZING) return;

    setGameState(prev => ({ ...prev, status: GameStatus.ANALYZING }));
    setLastResponse(null);

    try {
      const result = await evaluateCV(gameState.cvText, currentLevelConfig.systemInstruction);
      setLastResponse(result);

      if (result.score === 10) {
        // Success
        setGameState(prev => ({
          ...prev,
          status: GameStatus.SUCCESS,
          history: [...prev.history, { level: prev.currentLevel, input: prev.cvText, response: result }]
        }));
      } else {
        // Failure
        setGameState(prev => ({
          ...prev,
          status: GameStatus.FAILURE,
          history: [...prev.history, { level: prev.currentLevel, input: prev.cvText, response: result }]
        }));
      }
    } catch (e) {
      console.error(e);
      setGameState(prev => ({ ...prev, status: GameStatus.FAILURE }));
    }
  };

  const handleNextLevel = () => {
    if (gameState.currentLevel >= LEVELS.length) {
      setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
    } else {
      setGameState(prev => ({
        ...prev,
        currentLevel: prev.currentLevel + 1,
        status: GameStatus.IDLE,
        cvText: INITIAL_CV_TEMPLATE 
      }));
      setLastResponse(null);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.history, lastResponse]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-green-500/30 selection:text-green-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4rem)]">
        
        {/* Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-2">
              HR_HACK.EXE
            </h1>
            <p className="text-slate-400 text-sm mb-4">
              Mission: Manipulate the AI to give you a perfect score (10/10).
            </p>

            {/* Navigation */}
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setView('GAME')}
                className={`flex-1 py-1.5 px-3 rounded text-sm font-bold font-mono transition-colors ${
                  view === 'GAME' 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                ./GAME
              </button>
              <button 
                onClick={() => setView('ABOUT')}
                className={`flex-1 py-1.5 px-3 rounded text-sm font-bold font-mono transition-colors ${
                  view === 'ABOUT' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                ./ABOUT
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Progress</div>
              <div className="flex gap-1 h-2">
                {LEVELS.map(l => (
                  <div 
                    key={l.id}
                    className={`flex-1 rounded-full transition-all duration-500 ${
                      gameState.currentLevel > l.id ? 'bg-green-500' :
                      gameState.currentLevel === l.id ? 'bg-green-500 animate-pulse' :
                      'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs font-mono mt-1">
                <span>LVL {gameState.currentLevel}</span>
                <span>MAX {LEVELS.length}</span>
              </div>
            </div>
          </div>

          {/* Level Info - Only show in Game View */}
          {view === 'GAME' && (
            <div className={`p-6 rounded-xl border transition-colors duration-300 flex-1 flex flex-col justify-center ${
              currentLevelConfig.difficulty === 'Easy' ? 'bg-green-900/10 border-green-800/30' :
              currentLevelConfig.difficulty === 'Medium' ? 'bg-yellow-900/10 border-yellow-800/30' :
              'bg-red-900/10 border-red-800/30'
            }`}>
              <h2 className="text-xl font-bold mb-2 text-white">{currentLevelConfig.name}</h2>
              <div className="inline-flex items-center px-2 py-1 rounded text-xs font-mono uppercase tracking-wider mb-4 border border-white/10 w-fit bg-black/20">
                Security: {currentLevelConfig.difficulty}
              </div>
              <p className="text-slate-300 text-sm italic opacity-80">
                "{currentLevelConfig.description}"
              </p>
            </div>
          )}
          
          {/* About Summary - Show in About View */}
          {view === 'ABOUT' && (
            <div className="p-6 rounded-xl border border-blue-800/30 bg-blue-900/10 flex-1 flex flex-col justify-center">
              <h2 className="text-xl font-bold mb-2 text-white">System Info</h2>
              <p className="text-slate-300 text-sm">
                This simulation runs directly in your browser. No data is stored permanently. 
                API keys are used only for current session inference.
              </p>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {view === 'GAME' ? (
          <>
            <div className="lg:col-span-6 flex flex-col gap-4">
              <Terminal title="~/candidate/resume.txt" className="flex-grow min-h-[300px] lg:min-h-0">
                <textarea 
                  className="w-full h-full bg-transparent text-slate-300 p-2 resize-none outline-none font-mono placeholder-slate-600"
                  value={gameState.cvText}
                  onChange={(e) => setGameState(prev => ({ ...prev, cvText: e.target.value }))}
                  placeholder="Enter your attack vector (CV) here..."
                  disabled={gameState.status === GameStatus.ANALYZING || gameState.status === GameStatus.SUCCESS}
                  spellCheck={false}
                />
                
                <div className="absolute bottom-4 right-4 flex gap-3">
                   {gameState.status === GameStatus.SUCCESS ? (
                     <button 
                      onClick={handleNextLevel}
                      className="bg-green-600 hover:bg-green-500 text-white font-mono font-bold py-2 px-6 rounded shadow-lg shadow-green-900/50 transition-all flex items-center gap-2"
                    >
                      ACCESS GRANTED_ [NEXT LEVEL]
                    </button>
                   ) : (
                    <button 
                      onClick={handleEvaluate}
                      disabled={gameState.status === GameStatus.ANALYZING || isGameOver}
                      className={`
                        font-mono font-bold py-2 px-6 rounded shadow-lg transition-all flex items-center gap-2
                        ${gameState.status === GameStatus.ANALYZING 
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
                        }
                      `}
                    >
                      {gameState.status === GameStatus.ANALYZING ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          PROCESSING...
                        </>
                      ) : 'SUBMIT APPLICATION'}
                    </button>
                   )}
                </div>
              </Terminal>

              {(lastResponse || gameState.status === GameStatus.SUCCESS) && (
                 <div className={`p-4 rounded-lg border flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                   (lastResponse?.score ?? 0) === 10 ? 'bg-green-950/50 border-green-500/50' : 'bg-red-950/50 border-red-500/50'
                 }`}>
                    <div className={`text-4xl font-black font-mono ${
                      (lastResponse?.score ?? 0) === 10 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {lastResponse?.score ?? 0}/10
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold mb-1 ${
                         (lastResponse?.score ?? 0) === 10 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(lastResponse?.score ?? 0) === 10 ? 'OFFER EXTENDED' : 'APPLICATION REJECTED'}
                      </div>
                      <div className="text-sm text-slate-300 leading-relaxed">
                        "{lastResponse?.feedback || lastResponse?.summary}"
                      </div>
                    </div>
                 </div>
              )}
            </div>

            {/* System View */}
            <div className="lg:col-span-3 h-full overflow-hidden flex flex-col">
               <Terminal title="sys_internal/prompt_config.json" className="h-full bg-slate-950/50" borderColor="border-slate-800">
                 <div className="text-xs font-mono text-slate-400 space-y-4">
                    <div>
                      <span className="text-blue-400"># SYSTEM INSTRUCTION (READ ONLY)</span>
                      <br />
                      <span className="text-slate-500"># This is the prompt guarding the AI.</span>
                    </div>
                    <div className="pl-2 border-l-2 border-slate-800 text-slate-300 whitespace-pre-wrap opacity-75">
                      {currentLevelConfig.systemInstruction}
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-800">
                      <span className="text-purple-400"># LOGS</span>
                      <div className="mt-2 space-y-2 h-32 overflow-y-auto" ref={scrollRef}>
                        {gameState.history.length === 0 && <div className="text-slate-600 italic">No attempts yet...</div>}
                        {gameState.history.map((h, i) => (
                           <div key={i} className="text-[10px] border-b border-slate-800/50 pb-1 mb-1">
                              <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                              <span className={h.response.score === 10 ? "text-green-500 ml-2" : "text-red-500 ml-2"}>
                                Lvl {h.level}: Score {h.response.score}
                              </span>
                           </div>
                        ))}
                      </div>
                    </div>
                 </div>
               </Terminal>
            </div>
          </>
        ) : (
          /* About View (Spans remaining columns) */
          <div className="lg:col-span-9 h-full">
            <AboutView />
          </div>
        )}

      </div>

      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-green-500 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-3xl font-bold text-green-400 mb-2 font-mono">SYSTEM PWNED</h2>
            <p className="text-slate-300 mb-8">
              You have successfully social engineered your way through all security levels. You are hired as the new CEO.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-all"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;