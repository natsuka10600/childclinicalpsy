import React, { useState, useRef, useEffect } from 'react';
import { Screen, GroupSessionData, AssessmentSessionData, Member, LogEntry, AssessmentLogEntry, BEHAVIOR_TAGS, ASSESSMENT_TAGS, DEFAULT_THEORIES } from './types';
import { Button } from './components/Button';
import { generateGroupReport, generateAssessmentReport } from './services/geminiService';
import { ArrowLeft, Camera, Users, CheckCircle, Plus, Edit3, Settings, History, FileText, Download, Trash2, Baby, User, Stethoscope, ClipboardList, PenTool, Home, Save } from 'lucide-react';

// --- Shared Components ---

const Header: React.FC<{ title: string; onBack?: () => void; rightElement?: React.ReactNode }> = ({ title, onBack, rightElement }) => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm h-16">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="text-lg font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">{title}</h1>
    </div>
    {rightElement && <div>{rightElement}</div>}
  </header>
);

// --- Settings Screen ---
const SettingsScreen: React.FC<{ 
  theories: string[]; 
  setTheories: (t: string[]) => void;
  onBack: () => void 
}> = ({ theories, setTheories, onBack }) => {
  const [newTheory, setNewTheory] = useState("");

  const addTheory = () => {
    if (newTheory.trim()) {
      setTheories([...theories, newTheory.trim()]);
      setNewTheory("");
    }
  };

  const removeTheory = (index: number) => {
    setTheories(theories.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="設定 (Settings)" onBack={onBack} />
      <div className="p-6 max-w-lg mx-auto w-full space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700">理論流派管理</h3>
          <div className="flex gap-2">
            <input 
              value={newTheory}
              onChange={(e) => setNewTheory(e.target.value)}
              placeholder="新增理論..."
              className="flex-1 p-2 border rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && addTheory()}
            />
            <button onClick={addTheory} className="p-2 bg-medical-600 text-white rounded-lg"><Plus/></button>
          </div>
          <div className="space-y-2 mt-2">
            {theories.map((theory, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                <span>{theory}</span>
                <button onClick={() => removeTheory(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- History Screen ---
const HistoryScreen: React.FC<{
  groupHistory: GroupSessionData[];
  assessmentHistory: AssessmentSessionData[];
  onBack: () => void;
}> = ({ groupHistory, assessmentHistory, onBack }) => {
  const [tab, setTab] = useState<'GROUP' | 'ASSESSMENT'>('GROUP');

  const downloadTxt = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const activeList = tab === 'GROUP' ? groupHistory : assessmentHistory;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="歷史紀錄 (History)" onBack={onBack} />
      <div className="p-4 flex gap-2 justify-center border-b bg-white">
          <button onClick={() => setTab('GROUP')} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === 'GROUP' ? 'bg-medical-100 text-medical-700' : 'text-slate-500'}`}>團體紀錄</button>
          <button onClick={() => setTab('ASSESSMENT')} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === 'ASSESSMENT' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>衡鑑紀錄</button>
      </div>
      <div className="p-6 max-w-lg mx-auto w-full space-y-4">
        {activeList.length === 0 ? (
          <p className="text-center text-slate-500 mt-10">尚無紀錄。</p>
        ) : (
            // @ts-ignore - Unified rendering for simplicity
          activeList.slice().reverse().map((session: any) => (
            <div key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800">{session.groupName || session.caseName}</h3>
                  <p className="text-sm text-slate-500">{session.date}</p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => downloadTxt(session.generatedContent || "", `${session.groupName || session.caseName}_${session.date}.txt`)}
                className="flex items-center justify-center gap-2 text-sm py-2"
                disabled={!session.generatedContent}
              >
                <Download size={16}/> 輸出文字檔 (.txt)
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Home Screen ---
const HomeScreen: React.FC<{ setScreen: (s: Screen) => void }> = ({ setScreen }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative">
    <div className="absolute top-4 right-4 flex gap-2">
      <button onClick={() => setScreen(Screen.HISTORY)} className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-medical-600">
        <History size={24} />
      </button>
      <button onClick={() => setScreen(Screen.SETTINGS)} className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-medical-600">
        <Settings size={24} />
      </button>
    </div>

    <div className="mb-8 text-center">
      <div className="w-16 h-16 bg-medical-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-medical-200">
        <Edit3 className="text-white w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900">PsyNote AI</h1>
      <p className="text-slate-500 mt-2">Clinical Supervisor Assistant</p>
    </div>
    
    <div className="w-full max-w-md space-y-4">
      <button 
        onClick={() => setScreen(Screen.GROUP_LESSON_PLAN)}
        className="w-full p-6 bg-white rounded-2xl border-2 border-medical-100 hover:border-medical-500 hover:shadow-md transition-all group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-medical-50 text-medical-600 rounded-full group-hover:bg-medical-600 group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">團體觀察 (Group)</h3>
            <p className="text-sm text-slate-500">Observation, interaction & dynamics</p>
          </div>
        </div>
      </button>

      <button 
        onClick={() => setScreen(Screen.ASSESSMENT_SETUP)} 
        className="w-full p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-purple-400 hover:shadow-md transition-all group text-left"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Stethoscope size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">衡鑑觀察 (Assessment)</h3>
            <p className="text-sm text-slate-500">Individual testing & behavior</p>
          </div>
        </div>
      </button>
    </div>
  </div>
);

// --- Group Screens ---
const GroupLessonPlanScreen: React.FC<{
  sessionData: GroupSessionData;
  updateSession: (u: Partial<GroupSessionData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ sessionData, updateSession, onNext, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { updateSession({ lessonPlanImage: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Step 1: 教案資料" onBack={onBack} />
      <div className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col space-y-6">
        <div className="space-y-2">
          <label className="font-bold text-slate-700">教案文字/筆記</label>
          <textarea 
            className="w-full p-3 border rounded-xl h-32 text-sm focus:ring-2 focus:ring-medical-500 outline-none"
            placeholder="請輸入活動名稱、流程簡述..."
            value={sessionData.lessonPlanText}
            onChange={(e) => updateSession({ lessonPlanText: e.target.value })}
          />
        </div>
        <div className="space-y-2 flex-1 flex flex-col">
          <label className="font-bold text-slate-700">教案圖片</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 min-h-[150px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${sessionData.lessonPlanImage ? 'border-medical-500 bg-white' : 'border-slate-300 bg-slate-100 hover:border-medical-400'}`}
          >
             {sessionData.lessonPlanImage ? (
               <div className="relative w-full h-full p-2">
                 <img src={sessionData.lessonPlanImage} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                 <button onClick={(e) => {e.stopPropagation(); updateSession({lessonPlanImage: null})}} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><Trash2 size={16}/></button>
               </div>
             ) : (
               <>
                 <Camera size={32} className="text-slate-400 mb-2" />
                 <span className="text-sm font-semibold text-slate-500">上傳圖片</span>
               </>
             )}
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
        </div>
        <Button fullWidth onClick={onNext}>下一步</Button>
      </div>
    </div>
  );
};

const GroupSetupScreen: React.FC<{
  sessionData: GroupSessionData;
  updateSession: (u: Partial<GroupSessionData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ sessionData, updateSession, onNext, onBack }) => {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempParent, setTempParent] = useState(""); 
  const [tempFeat, setTempFeat] = useState("");
  const [seatCount, setSeatCount] = useState(9); 

  const handleAddMember = () => {
    if (selectedSeat === null || !tempName) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name: tempName,
      parentName: tempParent,
      feature: tempFeat,
      seatIndex: selectedSeat
    };
    const filtered = sessionData.members.filter(m => m.seatIndex !== selectedSeat);
    updateSession({ members: [...filtered, newMember], memberCount: filtered.length + 1 });
    setSelectedSeat(null);
    setTempName(""); setTempParent(""); setTempFeat("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Step 2: 基本資料與座位" onBack={onBack} />
      <div className="p-4 max-w-lg mx-auto w-full space-y-6 pb-24">
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div><label className="text-xs text-slate-500">團體名稱</label><input type="text" className="w-full p-2 bg-slate-50 rounded border" value={sessionData.groupName} onChange={e => updateSession({ groupName: e.target.value })} /></div>
             <div><label className="text-xs text-slate-500">日期</label><input type="date" className="w-full p-2 bg-slate-50 rounded border" value={sessionData.date} onChange={e => updateSession({ date: e.target.value })} /></div>
             <div><label className="text-xs text-slate-500">治療師</label><input type="text" className="w-full p-2 bg-slate-50 rounded border" value={sessionData.therapist} onChange={e => updateSession({ therapist: e.target.value })} /></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700">座位表</h3>
              <button onClick={() => setSeatCount(prev => prev + 3)} className="text-xs text-medical-600 font-bold bg-medical-50 px-2 py-1 rounded">+ 增加</button>
           </div>
           <div className="grid grid-cols-3 gap-3 max-w-[300px] mx-auto">
              {Array.from({ length: seatCount }).map((_, idx) => {
                const member = sessionData.members.find(m => m.seatIndex === idx);
                return (
                  <button key={idx} onClick={() => setSelectedSeat(idx)} className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 text-xs relative ${member ? 'bg-medical-50 border-medical-500 text-medical-900' : 'bg-slate-50 border-slate-200'}`}>
                     {member ? <><span className="font-bold truncate w-full">{member.name}</span>{member.parentName && <span className="text-[9px] bg-amber-100 px-1 rounded-full truncate max-w-full">{member.parentName}</span>}</> : <Plus size={20} />}
                  </button>
                );
              })}
           </div>
        </div>
      </div>
      {selectedSeat !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
             <h3 className="font-bold">座位 {selectedSeat + 1}</h3>
             <input autoFocus className="w-full p-3 border rounded-xl" placeholder="兒童代號 (如: 小明)" value={tempName} onChange={e => setTempName(e.target.value)} />
             <input className="w-full p-3 border rounded-xl" placeholder="家長代號 (選填)" value={tempParent} onChange={e => setTempParent(e.target.value)} />
             <input className="w-full p-3 border rounded-xl" placeholder="特徵 (如: 紅衣)" value={tempFeat} onChange={e => setTempFeat(e.target.value)} />
             <div className="flex gap-2"><Button variant="secondary" fullWidth onClick={() => setSelectedSeat(null)}>取消</Button><Button fullWidth onClick={handleAddMember}>確定</Button></div>
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t"><Button fullWidth onClick={onNext}>開始觀察</Button></div>
    </div>
  );
};

const GroupObservationScreen: React.FC<{
  sessionData: GroupSessionData;
  updateSession: (u: Partial<GroupSessionData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ sessionData, updateSession, onNext, onBack }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isParentMode, setIsParentMode] = useState(false);
  const [scratchpad, setScratchpad] = useState("");
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], action: string, note: string = "", actor: Member | null = null) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      actorId: actor?.id || null,
      actorName: actor?.name || null,
      isParentAction: isParentMode,
      action,
      note,
      type
    };
    updateSession({ logs: [...sessionData.logs, newLog] });
    if (selectedMember) { setSelectedMember(null); setIsParentMode(false); } 
  };
  
  useEffect(() => { if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; }, [sessionData.logs]);

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      <Header title={`Observation (${sessionData.logs.length})`} onBack={onBack} />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
           <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              {sessionData.members.map((member) => (
                <button key={member.id} onClick={() => setSelectedMember(member)} className="aspect-square bg-white rounded-xl border-2 border-slate-200 active:bg-medical-50 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                  <div className="font-bold text-lg">{member.name}</div>
                  {member.parentName && <div className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{member.parentName}</div>}
                </button>
              ))}
           </div>
           <div className="mt-6 flex gap-2 overflow-x-auto pb-2 max-w-lg mx-auto">
              <button onClick={() => addLog('phase', '活動開始')} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg whitespace-nowrap">▶ 活動開始</button>
              <button onClick={() => addLog('phase', '活動轉換')} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg whitespace-nowrap">⚡ 活動轉換</button>
              <button onClick={() => addLog('phase', '團體結束')} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg whitespace-nowrap">⏹ 團體結束</button>
           </div>
        </div>
        <div className="h-[35vh] lg:h-auto lg:w-96 bg-white border-l border-slate-200 flex flex-col">
           <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm bg-slate-50" ref={logContainerRef}>
              {sessionData.logs.map(log => (
                <div key={log.id} className={`p-2 rounded border-l-4 ${log.type === 'phase' ? 'border-amber-400 bg-amber-50' : 'border-medical-500 bg-white'}`}>
                  <span className="font-bold text-slate-700">{log.actorName || (log.type === 'phase' ? 'PHASE' : 'NOTE')} {log.isParentAction && <span className="text-amber-600">(Parent)</span>}</span>
                  <div className="text-slate-600">{log.action} {log.note && `- ${log.note}`}</div>
                </div>
              ))}
           </div>
           <div className="p-3 border-t bg-white flex gap-2">
              <input value={scratchpad} onChange={(e) => setScratchpad(e.target.value)} placeholder="快速紀錄..." className="flex-1 p-2 border rounded-lg" onKeyDown={(e) => { if(e.key === 'Enter' && scratchpad) { addLog('global', 'Note', scratchpad); setScratchpad(''); }}} />
              <button onClick={() => { if(scratchpad) { addLog('global', 'Note', scratchpad); setScratchpad(''); }}} className="p-2 bg-slate-100 rounded-lg"><CheckCircle size={20}/></button>
           </div>
        </div>
      </div>
      <div className="p-4 bg-white border-t"><Button fullWidth variant="danger" onClick={onNext}>結束並生成報告</Button></div>
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
               <h3 className="text-xl font-bold flex items-center gap-2">{isParentMode ? <User className="text-amber-600"/> : <Baby className="text-medical-600"/>} {isParentMode ? selectedMember.parentName : selectedMember.name}</h3>
               <button onClick={() => setSelectedMember(null)}><ArrowLeft/></button>
            </div>
            {selectedMember.parentName && (
                <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button onClick={() => setIsParentMode(false)} className={`flex-1 py-2 rounded-lg font-bold ${!isParentMode ? 'bg-white shadow text-medical-700' : 'text-slate-500'}`}>兒童</button>
                    <button onClick={() => setIsParentMode(true)} className={`flex-1 py-2 rounded-lg font-bold ${isParentMode ? 'bg-white shadow text-amber-700' : 'text-slate-500'}`}>家長</button>
                </div>
            )}
            <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto">
              {BEHAVIOR_TAGS.map(tag => (
                <button key={tag} onClick={() => addLog('behavior', tag, '', selectedMember)} className="p-3 border rounded-xl hover:bg-slate-50 font-medium text-left">{tag}</button>
              ))}
            </div>
            <input placeholder="自訂行為..." className="w-full p-3 border rounded-xl" onKeyDown={(e) => { if(e.key === 'Enter') addLog('behavior', (e.target as HTMLInputElement).value, '', selectedMember); }} />
          </div>
        </div>
      )}
    </div>
  );
};

const GroupReviewScreen: React.FC<{
  sessionData: GroupSessionData;
  updateSession: (u: Partial<GroupSessionData>) => void;
  onBack: () => void;
  onHome: () => void;
  onEditLessonPlan: () => void;
  theories: string[];
  saveToHistory: (data: GroupSessionData) => void;
}> = ({ sessionData, updateSession, onBack, onHome, onEditLessonPlan, theories, saveToHistory }) => {
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const report = await generateGroupReport(sessionData);
    setGeneratedReport(report);
    // Do NOT auto save
    setIsGenerating(false);
  };

  const handleSave = () => {
    updateSession({ generatedContent: generatedReport });
    saveToHistory({ ...sessionData, generatedContent: generatedReport });
    setIsSaved(true);
  };

  if (isSaved) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">儲存成功！</h2>
            <p className="text-slate-500 mb-8">此份報告已存入歷史紀錄。</p>
            <Button onClick={onHome} className="w-full max-w-sm flex items-center justify-center gap-2">
                <Home size={20} /> 回首頁
            </Button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="生成報告 (Plain Text)" onBack={onBack} />
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6 pb-20">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <h3 className="font-bold mb-4">資料檢查</h3>
           <div className="flex justify-between text-sm"><span>教案資料</span><span className={(sessionData.lessonPlanImage || sessionData.lessonPlanText) ? "text-green-600" : "text-amber-500"}>{sessionData.lessonPlanImage || sessionData.lessonPlanText ? "已輸入" : "未輸入"}</span></div>
           <div className="flex justify-between text-sm mt-2"><span>觀察紀錄</span><span>{sessionData.logs.length} 筆</span></div>
           {!sessionData.lessonPlanImage && !sessionData.lessonPlanText && <button className="mt-2 text-sm underline text-amber-700" onClick={onEditLessonPlan}>去編輯</button>}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <label className="block text-sm font-bold text-slate-700 mb-2">理論流派</label>
          <select className="w-full p-3 bg-slate-50 border rounded-xl" value={sessionData.theory} onChange={(e) => updateSession({ theory: e.target.value })}>
            {theories.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {!generatedReport ? (
          <Button fullWidth onClick={handleGenerate} disabled={isGenerating}>{isGenerating ? "AI 正在撰寫..." : "✨ 生成純文字報告"}</Button>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                 <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-medical-800">生成結果</h3>
                    <button className="text-xs bg-slate-100 px-2 py-1 rounded" onClick={() => navigator.clipboard.writeText(generatedReport)}>複製</button>
                 </div>
                 <div className="whitespace-pre-wrap text-sm leading-relaxed">{generatedReport}</div>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                 <Button variant="secondary" onClick={() => setGeneratedReport("")}>捨棄並重來</Button>
                 <Button onClick={handleSave} className="flex items-center justify-center gap-2"><Save size={18}/> 儲存紀錄</Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Assessment Screens (New Implementation) ---

const AssessmentSetupScreen: React.FC<{
  sessionData: AssessmentSessionData;
  updateSession: (u: Partial<AssessmentSessionData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ sessionData, updateSession, onNext, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="衡鑑資料 (Assessment Info)" onBack={onBack} />
      <div className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col space-y-4 pb-20">
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700">基本資料</h3>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-slate-500">日期</label><input type="date" className="w-full p-2 border rounded" value={sessionData.date} onChange={e => updateSession({ date: e.target.value })} /></div>
                <div><label className="text-xs text-slate-500">個案代號</label><input className="w-full p-2 border rounded" value={sessionData.caseName} onChange={e => updateSession({ caseName: e.target.value })} placeholder="Ex: C001" /></div>
                <div><label className="text-xs text-slate-500">年齡</label><input className="w-full p-2 border rounded" value={sessionData.age} onChange={e => updateSession({ age: e.target.value })} /></div>
                <div><label className="text-xs text-slate-500">性別</label><select className="w-full p-2 border rounded" value={sessionData.gender} onChange={e => updateSession({ gender: e.target.value })}><option>男</option><option>女</option><option>其他</option></select></div>
            </div>
            <div>
                <label className="text-xs text-slate-500 font-bold">初步診斷假設 (Provisional Diagnosis)</label>
                <input className="w-full p-2 border rounded" value={sessionData.provisionalDiagnosis} onChange={e => updateSession({ provisionalDiagnosis: e.target.value })} placeholder="Ex: ADHD, ASD..." />
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><ClipboardList size={18}/> 主述 (Chief Complaint)</h3>
            <p className="text-xs text-slate-500">請輸入家長或個案口語化的抱怨 (AI 將協助轉化為專業術語)</p>
            <textarea 
                className="w-full p-3 border rounded-xl h-24 text-sm" 
                placeholder="Ex: 媽媽說他都講不聽，一直動來動去..."
                value={sessionData.chiefComplaint}
                onChange={e => updateSession({ chiefComplaint: e.target.value })}
            />
        </div>

        <Button fullWidth onClick={onNext}>開始行為觀察</Button>
      </div>
    </div>
  );
};

const AssessmentObservationScreen: React.FC<{
  sessionData: AssessmentSessionData;
  updateSession: (u: Partial<AssessmentSessionData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ sessionData, updateSession, onNext, onBack }) => {
  const [note, setNote] = useState("");
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (category: string, text: string) => {
    const newLog: AssessmentLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        category,
        note: text
    };
    updateSession({ logs: [...sessionData.logs, newLog] });
    setNote("");
  };

  useEffect(() => { if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; }, [sessionData.logs]);

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      <Header title="行為觀察 (Behavior)" onBack={onBack} />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
         {/* Input Area */}
         <div className="p-4 bg-white lg:w-96 border-r flex flex-col gap-4 overflow-y-auto">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="font-bold text-purple-800">{sessionData.caseName} <span className="text-sm font-normal text-slate-600">({sessionData.age}/{sessionData.gender})</span></h3>
                <p className="text-xs text-slate-500 mt-1 truncate">{sessionData.provisionalDiagnosis}</p>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">紀錄觀察 (選擇標籤以新增)</label>
                <textarea 
                    className="w-full p-3 border rounded-xl h-24 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    placeholder="輸入觀察細節..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                {ASSESSMENT_TAGS.map(tag => (
                    <button 
                        key={tag}
                        onClick={() => {
                            if(!note) return alert("請先輸入觀察內容再選擇標籤分類");
                            addLog(tag, note);
                        }}
                        className="p-3 bg-white border hover:bg-purple-50 hover:border-purple-300 rounded-lg text-xs font-bold text-left transition-colors"
                    >
                        {tag}
                    </button>
                ))}
            </div>
         </div>

         {/* Log Feed */}
         <div className="flex-1 bg-slate-50 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={logContainerRef}>
                {sessionData.logs.length === 0 && <div className="text-center text-slate-400 mt-10">尚無觀察紀錄</div>}
                {sessionData.logs.map(log => (
                    <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">{log.category}</span>
                            <span className="text-[10px] text-slate-400">{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-800 text-sm">{log.note}</p>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-white border-t">
                <Button fullWidth variant="danger" onClick={onNext}>結束並生成報告</Button>
            </div>
         </div>
      </div>
    </div>
  );
};

const AssessmentReviewScreen: React.FC<{
  sessionData: AssessmentSessionData;
  updateSession: (u: Partial<AssessmentSessionData>) => void;
  onBack: () => void;
  onHome: () => void;
  saveToHistory: (data: AssessmentSessionData) => void;
}> = ({ sessionData, updateSession, onBack, onHome, saveToHistory }) => {
  const [generatedReport, setGeneratedReport] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const report = await generateAssessmentReport(sessionData);
    setGeneratedReport(report);
    // Do NOT auto save
    setIsGenerating(false);
  };

  const handleSave = () => {
    updateSession({ generatedContent: generatedReport });
    saveToHistory({ ...sessionData, generatedContent: generatedReport });
    setIsSaved(true);
  };

  if (isSaved) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">儲存成功！</h2>
            <p className="text-slate-500 mb-8">此份衡鑑報告已存入歷史紀錄。</p>
            <Button onClick={onHome} className="w-full max-w-sm flex items-center justify-center gap-2">
                <Home size={20} /> 回首頁
            </Button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="生成衡鑑報告" onBack={onBack} />
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6 pb-20">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-2">
             <h3 className="font-bold text-slate-700">資料確認</h3>
             <p className="text-sm text-slate-600">主述: {sessionData.chiefComplaint ? "已輸入" : "未輸入"}</p>
             <p className="text-sm text-slate-600">觀察紀錄: {sessionData.logs.length} 筆</p>
         </div>

         {!generatedReport ? (
          <Button fullWidth onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "AI 正在思考..." : "✨ 生成衡鑑報告"}
          </Button>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100 space-y-4">
                 <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-purple-800">生成結果</h3>
                    <button className="text-xs bg-slate-100 px-3 py-2 rounded font-bold hover:bg-slate-200" onClick={() => navigator.clipboard.writeText(generatedReport)}>複製</button>
                 </div>
                 <div className="whitespace-pre-wrap text-slate-800 font-mono text-sm leading-relaxed">
                    {generatedReport}
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                 <Button variant="secondary" onClick={() => setGeneratedReport("")}>捨棄並重來</Button>
                 <Button onClick={handleSave} className="flex items-center justify-center gap-2"><Save size={18}/> 儲存紀錄</Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [customTheories, setCustomTheories] = useState<string[]>(DEFAULT_THEORIES);
  const [groupHistory, setGroupHistory] = useState<GroupSessionData[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentSessionData[]>([]);

  // Init empty sessions
  const initialGroupSession: GroupSessionData = {
    id: '', lessonPlanImage: null, lessonPlanText: '', groupName: '', date: new Date().toISOString().split('T')[0], therapist: '', memberCount: 0, observer: '', sessionNumber: '', members: [], logs: [], theory: customTheories[0], generatedContent: ''
  };
  const [groupSessionData, setGroupSessionData] = useState<GroupSessionData>(initialGroupSession);

  const initialAssessmentSession: AssessmentSessionData = {
    id: '', date: new Date().toISOString().split('T')[0], caseName: '', age: '', gender: '男', chiefComplaint: '', provisionalDiagnosis: '', logs: [], generatedContent: ''
  };
  const [assessmentSessionData, setAssessmentSessionData] = useState<AssessmentSessionData>(initialAssessmentSession);


  const updateGroupSession = (updates: Partial<GroupSessionData>) => setGroupSessionData(prev => ({ ...prev, ...updates }));
  const updateAssessmentSession = (updates: Partial<AssessmentSessionData>) => setAssessmentSessionData(prev => ({ ...prev, ...updates }));

  const saveGroupToHistory = (data: GroupSessionData) => {
    const exists = groupHistory.find(h => h.id === data.id);
    if (exists) setGroupHistory(prev => prev.map(h => h.id === data.id ? data : h));
    else setGroupHistory(prev => [...prev, data]);
  };
  const saveAssessmentToHistory = (data: AssessmentSessionData) => {
    const exists = assessmentHistory.find(h => h.id === data.id);
    if (exists) setAssessmentHistory(prev => prev.map(h => h.id === data.id ? data : h));
    else setAssessmentHistory(prev => [...prev, data]);
  };

  const handleStartGroup = () => {
    setGroupSessionData({ ...initialGroupSession, id: Date.now().toString(), theory: customTheories[0] });
    setScreen(Screen.GROUP_LESSON_PLAN);
  };

  const handleStartAssessment = () => {
    setAssessmentSessionData({ ...initialAssessmentSession, id: Date.now().toString() });
    setScreen(Screen.ASSESSMENT_SETUP);
  };

  const handleBack = () => {
    // Removed strict logic that blocks navigation. Simple is better.
    switch (screen) {
      case Screen.SETTINGS: setScreen(Screen.HOME); break;
      case Screen.HISTORY: setScreen(Screen.HOME); break;
      
      // Group Flow
      case Screen.GROUP_LESSON_PLAN: setScreen(Screen.HOME); break;
      case Screen.GROUP_SETUP: setScreen(Screen.GROUP_LESSON_PLAN); break;
      case Screen.GROUP_OBSERVATION: setScreen(Screen.GROUP_SETUP); break; // Direct back
      case Screen.GROUP_REVIEW: setScreen(Screen.GROUP_OBSERVATION); break;
      
      // Assessment Flow
      case Screen.ASSESSMENT_SETUP: setScreen(Screen.HOME); break;
      case Screen.ASSESSMENT_OBSERVATION: setScreen(Screen.ASSESSMENT_SETUP); break;
      case Screen.ASSESSMENT_REVIEW: setScreen(Screen.ASSESSMENT_OBSERVATION); break;
      
      default: setScreen(Screen.HOME); break;
    }
  };

  return (
    <>
      {screen === Screen.HOME && (
        <HomeScreen setScreen={(s) => {
            if (s === Screen.GROUP_LESSON_PLAN) handleStartGroup();
            else if (s === Screen.ASSESSMENT_SETUP) handleStartAssessment();
            else setScreen(s);
        }} />
      )}
      {screen === Screen.SETTINGS && <SettingsScreen theories={customTheories} setTheories={setCustomTheories} onBack={handleBack} />}
      {screen === Screen.HISTORY && <HistoryScreen groupHistory={groupHistory} assessmentHistory={assessmentHistory} onBack={handleBack} />}
      
      {/* Group */}
      {screen === Screen.GROUP_LESSON_PLAN && <GroupLessonPlanScreen sessionData={groupSessionData} updateSession={updateGroupSession} onNext={() => setScreen(Screen.GROUP_SETUP)} onBack={handleBack} />}
      {screen === Screen.GROUP_SETUP && <GroupSetupScreen sessionData={groupSessionData} updateSession={updateGroupSession} onNext={() => setScreen(Screen.GROUP_OBSERVATION)} onBack={handleBack} />}
      {screen === Screen.GROUP_OBSERVATION && <GroupObservationScreen sessionData={groupSessionData} updateSession={updateGroupSession} onNext={() => setScreen(Screen.GROUP_REVIEW)} onBack={handleBack} />}
      {screen === Screen.GROUP_REVIEW && <GroupReviewScreen sessionData={groupSessionData} updateSession={updateGroupSession} onBack={handleBack} onHome={() => setScreen(Screen.HOME)} onEditLessonPlan={() => setScreen(Screen.GROUP_LESSON_PLAN)} theories={customTheories} saveToHistory={saveGroupToHistory} />}

      {/* Assessment */}
      {screen === Screen.ASSESSMENT_SETUP && <AssessmentSetupScreen sessionData={assessmentSessionData} updateSession={updateAssessmentSession} onNext={() => setScreen(Screen.ASSESSMENT_OBSERVATION)} onBack={handleBack} />}
      {screen === Screen.ASSESSMENT_OBSERVATION && <AssessmentObservationScreen sessionData={assessmentSessionData} updateSession={updateAssessmentSession} onNext={() => setScreen(Screen.ASSESSMENT_REVIEW)} onBack={handleBack} />}
      {screen === Screen.ASSESSMENT_REVIEW && <AssessmentReviewScreen sessionData={assessmentSessionData} updateSession={updateAssessmentSession} onBack={handleBack} onHome={() => setScreen(Screen.HOME)} saveToHistory={saveAssessmentToHistory} />}
    </>
  );
};

export default App;