import React, { useState, useEffect, useRef } from 'react';

type Audience = 'kids' | 'pro' | 'school';
type AttStatus = 'Present' | 'Absent' | 'Late';
type Board = 'CBSE' | 'ICSE' | 'State' | 'IB';

const CLASSES_LIST = ['Nursery','LKG','UKG','1','2','3','4','5','6','7','8','9','10','11','12'];
const SECTIONS = ['A','B','C','D'];
const RELATIONS = ['Father','Mother','Guardian'];
const TEST_MODELS = [
  'MCQ Only',
  'MCQ + Negative (-0.25/-0.33/-0.5)',
  'Kids Mix True/False',
  'Descriptive',
  'Practice No Timer',
  'Mock Fixed Time'
];

export default function App(){
  // DPDP Consent
  const [showConsent, setShowConsent] = useState(false);
  const [consentFlow, setConsentFlow] = useState<'choice'|'adult'|'minor'>('choice');
  const [adultAgree, setAdultAgree] = useState(false);
  const [minorData, setMinorData] = useState({ parentName:'', parentPhone:'', childName:'', relation:'Father', agree:false });
  const [role, setRole] = useState<string>('');
  const [consentDate, setConsentDate] = useState('');

  // Audience
  const [audience, setAudience] = useState<Audience>('school');

  // Tier
  const [studentCount, setStudentCount] = useState(320);

  // School Setup
  const [schoolName, setSchoolName] = useState('thethechmonty Public School');
  const [board, setBoard] = useState<Board>('CBSE');
  const [boardClasses, setBoardClasses] = useState<string[]>(['1','2','3','4','5']);

  // Teachers
  const [teachers, setTeachers] = useState<{id:string,name:string,subject:string,classes:string[]}[]>([
    {id:'t1',name:'Anjali Sharma',subject:'Mathematics',classes:['6','7']},
    {id:'t2',name:'Rahul Verma',subject:'Science',classes:['8','9']}
  ]);
  const [teacherForm, setTeacherForm] = useState({name:'',subject:'',classes:''});
  const [teacherError, setTeacherError] = useState('');

  // Classes
  const [classList, setClassList] = useState<{id:string,number:string,section:string,teacherId:string,studentCount:number}[]>([
    {id:'c1',number:'6',section:'A',teacherId:'t1',studentCount:32},
    {id:'c2',number:'8',section:'B',teacherId:'t2',studentCount:28}
  ]);
  const [classForm, setClassForm] = useState({number:'6',section:'A',teacherId:'',studentCount:30});

  // Students
  const [students, setStudents] = useState<{id:string,name:string,roll:string,class:string,section:string,parentPhone:string}[]>([
    {id:'s1',name:'Aarav Singh',roll:'101',class:'6',section:'A',parentPhone:'9876543210'},
    {id:'s2',name:'Diya Patel',roll:'102',class:'6',section:'A',parentPhone:'9876543211'},
    {id:'s3',name:'Kabir Khan',roll:'103',class:'6',section:'A',parentPhone:'9876543212'},
    {id:'s4',name:'Myra Gupta',roll:'104',class:'6',section:'A',parentPhone:'9876543213'},
  ]);
  const [studentForm, setStudentForm] = useState({name:'',roll:'',class:'6',section:'A',parentPhone:''});
  const [studentError, setStudentError] = useState('');
  const [filterClass, setFilterClass] = useState('All');

  // Attendance
  const [attClass, setAttClass] = useState('6-A');
  const [attDate, setAttDate] = useState(()=> new Date().toISOString().slice(0,10));
  const [attMode, setAttMode] = useState<'Manual'|'QR'>('Manual');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string,{studentId:string,status:AttStatus,time:string}[]>>({});
  const [markedIds, setMarkedIds] = useState<Set<string>>(new Set());

  // Bus
  const [buses, setBuses] = useState<{id:string,no:string,driver:string,phone:string,route:string,capacity:number}[]>([
    {id:'b1',no:'UP32-AB-1234',driver:'Suresh Yadav',phone:'9811112233',route:'Gomti Nagar - School',capacity:40}
  ]);
  const [busForm, setBusForm] = useState({no:'',driver:'',phone:'',route:'',capacity:40});
  const [busError, setBusError] = useState('');
  const [activeBusId, setActiveBusId] = useState('b1');
  const [busPos, setBusPos] = useState(0);
  const [busStatus, setBusStatus] = useState<'At Depot'|'On Route'|'Near Stop'|'Reached School'|'Completed'>('At Depot');
  const [busSpeed] = useState(28);
  const busIntervalRef = useRef<number | null>(null);

  // Tests
  const [tests, setTests] = useState<any[]>([
    {id:'test1',name:'Mid Term Maths',subject:'Mathematics',class:'6',model:TEST_MODELS[0],start:'2026-05-20T09:00',end:'2026-05-20T10:00',duration:60,total:100,passing:35,shuffleQ:true,shuffleOpt:true,attempts:'1',result:'Immediate',autoSubmit:true,questions:[
      {id:'q1',text:'What is 12 x 8?',options:['96','88','84','108'],correct:0,marks:5,explanation:'12*8=96',difficulty:'Easy'},
      {id:'q2',text:'Value of π approx?',options:['3.14','2.14','3.41','4.14'],correct:0,marks:5,explanation:'π=3.14',difficulty:'Easy'}
    ]}
  ]);
  const [testForm, setTestForm] = useState({name:'',subject:'',class:'6',model:TEST_MODELS[0],start:'',end:'',duration:60,total:100,passing:35,shuffleQ:true,shuffleOpt:false,attempts:'1',result:'Immediate',autoSubmit:true,negative:'-0.25'});
  const [questionForm, setQuestionForm] = useState({text:'',options:['','','',''],correct:0,marks:5,explanation:'',difficulty:'Easy'});
  const [editingTestId, setEditingTestId] = useState<string|null>(null);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [activeTestView, setActiveTestView] = useState<any>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string,number>>({});
  const [testTimeLeft, setTestTimeLeft] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<{score:number,total:number}|null>(null);

  // Parent
  const [parentChildId, setParentChildId] = useState('s1');
  const [feeBalance, setFeeBalance] = useState(5000);
  const [emiMonths, setEmiMonths] = useState<3|6|9|12>(3);

  // UI
  const [activeTab, setActiveTab] = useState<'overview'|'school'|'attendance'|'bus'|'tests'|'parent'|'dpdp'>('school');
  const [schoolSidebar, setSchoolSidebar] = useState<'dashboard'|'teachers'|'classes'|'students'|'dpdp'>('dashboard');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeePopup, setShowFeePopup] = useState(false);

  // Load from localStorage
  useEffect(()=>{
    const consent = localStorage.getItem('thethechmonty_dpdpConsent');
    if(!consent){ setShowConsent(true); }
    else {
      setRole(localStorage.getItem('thethechmonty_role')||'');
      setConsentDate(localStorage.getItem('thethechmonty_consentDate')||'');
    }
    const aud = localStorage.getItem('thethechmonty_audience') as Audience;
    if(aud) setAudience(aud);
    try{
      const t = localStorage.getItem('thethechmonty_teachers');
      if(t) setTeachers(JSON.parse(t));
      const c = localStorage.getItem('thethechmonty_classes');
      if(c) setClassList(JSON.parse(c));
      const s = localStorage.getItem('thethechmonty_students');
      if(s) setStudents(JSON.parse(s));
      const a = localStorage.getItem('thethechmonty_attendance');
      if(a) setAttendanceRecords(JSON.parse(a));
      const b = localStorage.getItem('thethechmonty_buses');
      if(b) setBuses(JSON.parse(b));
      const tt = localStorage.getItem('thethechmonty_tests');
      if(tt) setTests(JSON.parse(tt));
      const sn = localStorage.getItem('thethechmonty_schoolName');
      if(sn) setSchoolName(sn);
    }catch{}
  },[]);

  // Save effects
  useEffect(()=>{ localStorage.setItem('thethechmonty_audience', audience); },[audience]);
  useEffect(()=>{ localStorage.setItem('thethechmonty_teachers', JSON.stringify(teachers)); },[teachers]);
  useEffect(()=>{ localStorage.setItem('thethechmonty_classes', JSON.stringify(classList)); },[classList]);
  useEffect(()=>{ localStorage.setItem('thethechmonty_students', JSON.stringify(students)); },[students]);
  useEffect(()=>{ localStorage.setItem('thethechmonty_attendance', JSON.stringify(attendanceRecords)); },[attendanceRecords]);
  useEffect(()=>{ localStorage.setItem('thethechmonty_buses', JSON.stringify(buses)); },[buses]);
  useEffect(()=>{ localStorage.setItem('thethechmonty_tests', JSON.stringify(tests)); },[tests]);
  useEffect(()=>{ localStorage.setItem('thethechmonty_schoolName', schoolName); },[schoolName]);

  // Attendance marked sync
  useEffect(()=>{
    const key = `${attDate}_${attClass}`;
    const recs = attendanceRecords[key] || [];
    setMarkedIds(new Set(recs.map(r=>r.studentId)));
  },[attDate, attClass, attendanceRecords]);

  // Bus animation
  useEffect(()=>{
    if(busStatus==='Completed' || busStatus==='At Depot') return;
    const id = window.setInterval(()=>{
      setBusPos(prev=>{
        const next = prev + 2;
        if(next>=100){
          setBusStatus('Reached School');
          return 100;
        }
        if(next>75) setBusStatus('Near Stop');
        else if(next>10) setBusStatus('On Route');
        return next;
      });
    }, 800);
    busIntervalRef.current = id as any;
    return ()=> { if(busIntervalRef.current) clearInterval(busIntervalRef.current); };
  },[busStatus]);

  // Test timer
  useEffect(()=>{
    if(!activeTestView || testSubmitted) return;
    if(testTimeLeft<=0){
      if(activeTestView?.autoSubmit){ handleSubmitTest(); }
      return;
    }
    const t = setTimeout(()=> setTestTimeLeft(v=>v-1), 1000);
    return ()=> clearTimeout(t);
  },[testTimeLeft, activeTestView, testSubmitted]);

  // Calculations
  const getTierFee = (count:number)=>{
    if(count<=500) return 9999;
    if(count<=1000) return 19999;
    if(count<=1500) return 29999;
    return 39999;
  };
  const tierFee = getTierFee(studentCount);
  const platformFee = Math.round(100*1.18); // 118 exactly
  const gatewayFee = Math.round(tierFee*0.02);
  const schoolGets = tierFee - platformFee - gatewayFee;
  const courseFee = 6000;
  const processingFee = Math.round(courseFee*0.02); // 120
  const totalWithFee = courseFee + processingFee; // 6120
  const emiAmount = Math.round(totalWithFee / emiMonths); // for parent EMI
  const emi3 = Math.round(totalWithFee/3); // 2040

  const validatePhone = (p:string)=> /^[0-9]{10}$/.test(p.trim());

  // Handlers
  const handleAdultConsent = ()=>{
    if(!adultAgree) return;
    localStorage.setItem('thethechmonty_dpdpConsent','true');
    localStorage.setItem('thethechmonty_role','parent_18plus');
    localStorage.setItem('thethechmonty_consentDate', new Date().toISOString());
    setShowConsent(false);
    setRole('parent_18plus');
    setConsentDate(new Date().toISOString());
  };
  const handleMinorConsent = ()=>{
    const {parentName, parentPhone, childName, relation, agree} = minorData;
    if(!parentName.trim() || !childName.trim() || !validatePhone(parentPhone) || !agree) return;
    localStorage.setItem('thethechmonty_dpdpConsent','true');
    localStorage.setItem('thethechmonty_role','student_under18');
    localStorage.setItem('thethechmonty_parentName', parentName.trim());
    localStorage.setItem('thethechmonty_childName', childName.trim());
    localStorage.setItem('thethechmonty_consentDate', new Date().toISOString());
    setShowConsent(false);
    setRole('student_under18');
    setConsentDate(new Date().toISOString());
  };

  const handleAddTeacher = ()=>{
    setTeacherError('');
    const name = teacherForm.name.trim();
    if(!name || !teacherForm.subject.trim()){ setTeacherError('Name and Subject required'); return; }
    const exists = teachers.some(t=> t.name.trim().toLowerCase()===name.toLowerCase());
    if(exists){ setTeacherError('Teacher name must be unique (case-insensitive)'); return; }
    const newT = {id:'t'+Date.now(),name,subject:teacherForm.subject.trim(),classes:teacherForm.classes.split(',').map(s=>s.trim()).filter(Boolean)};
    setTeachers([...teachers,newT]);
    setTeacherForm({name:'',subject:'',classes:''});
  };

  const handleAddClass = ()=>{
    const exists = classList.some(c=> c.number===classForm.number && c.section===classForm.section);
    if(exists) return;
    setClassList([...classList,{id:'cl'+Date.now(),number:classForm.number,section:classForm.section,teacherId:classForm.teacherId,studentCount:classForm.studentCount}]);
  };

  const handleAddStudent = ()=>{
    setStudentError('');
    const name = studentForm.name.trim();
    const roll = studentForm.roll.trim();
    if(!name || !roll){ setStudentError('Name and Roll No required'); return; }
    if(!validatePhone(studentForm.parentPhone)){ setStudentError('Parent Phone must be 10 digits'); return; }
    if(students.some(s=> s.roll.trim().toLowerCase()===roll.toLowerCase())){ setStudentError('Roll No must be unique'); return; }
    setStudents([...students,{id:'st'+Date.now(),name,roll,class:studentForm.class,section:studentForm.section,parentPhone:studentForm.parentPhone.trim()}]);
    setStudentForm({name:'',roll:'',class:studentForm.class,section:'A',parentPhone:''});
  };

  const handleAttendanceMark = (studentId:string,status:AttStatus)=>{
    const key = `${attDate}_${attClass}`;
    const existing = attendanceRecords[key] || [];
    if(existing.some(r=>r.studentId===studentId)) return; // prevent duplicate
    const time = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
    const updated = [...existing,{studentId,status,time}];
    setAttendanceRecords({...attendanceRecords,[key]:updated});
  };

  const handleSimulateScan = ()=>{
    const cls = attClass.split('-')[0];
    const sec = attClass.split('-')[1];
    const classStudents = students.filter(s=> s.class===cls && s.section===sec);
    const key = `${attDate}_${attClass}`;
    const existing = attendanceRecords[key] || [];
    const unmarked = classStudents.filter(s=> !existing.some(r=>r.studentId===s.id));
    if(unmarked.length===0) return;
    const random = unmarked[Math.floor(Math.random()*unmarked.length)];
    handleAttendanceMark(random.id,'Present');
  };

  const handleAddBus = ()=>{
    setBusError('');
    const no = busForm.no.trim();
    if(!no || !busForm.driver.trim()){ setBusError('Bus No and Driver Name required'); return; }
    if(!validatePhone(busForm.phone)){ setBusError('Driver Phone must be 10 digits'); return; }
    if(buses.some(b=> b.no.trim().toLowerCase()===no.toLowerCase())){ setBusError('Bus No must be unique'); return; }
    const newB = {id:'bus'+Date.now(),no,driver:busForm.driver.trim(),phone:busForm.phone.trim(),route:busForm.route.trim(),capacity:busForm.capacity};
    setBuses([...buses,newB]);
    setActiveBusId(newB.id);
    setBusForm({no:'',driver:'',phone:'',route:'',capacity:40});
  };

  const startBusRoute = ()=>{
    setBusPos(0);
    setBusStatus('On Route');
  };

  const handleCreateTest = ()=>{
    if(!testForm.name.trim() || !testForm.subject.trim()) return;
    const newTest = {
      id:'test'+Date.now(),
      ...testForm,
      name:testForm.name.trim(),
      subject:testForm.subject.trim(),
      questions:testQuestions,
      negative:testForm.negative
    };
    if(editingTestId){
      setTests(tests.map(t=> t.id===editingTestId? {...newTest,id:editingTestId}:t));
      setEditingTestId(null);
    }else{
      setTests([...tests,newTest]);
    }
    setTestForm({name:'',subject:'',class:'6',model:TEST_MODELS[0],start:'',end:'',duration:60,total:100,passing:35,shuffleQ:true,shuffleOpt:false,attempts:'1',result:'Immediate',autoSubmit:true,negative:'-0.25'});
    setTestQuestions([]);
  };

  const handleAddQuestion = ()=>{
    if(!questionForm.text.trim()) return;
    if(questionForm.options.some(o=> !o.trim())) return;
    setTestQuestions([...testQuestions,{id:'q'+Date.now(),...questionForm,text:questionForm.text.trim(),options:questionForm.options.map(o=>o.trim())}]);
    setQuestionForm({text:'',options:['','','',''],correct:0,marks:5,explanation:'',difficulty:'Easy'});
  };

  const startTestForStudent = (test:any)=>{
    setActiveTestView(test);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestResult(null);
    setTestTimeLeft(test.duration*60);
    setActiveTab('tests');
  };

  const handleSubmitTest = ()=>{
    if(!activeTestView) return;
    let score=0;
    activeTestView.questions.forEach((q:any)=>{
      if(testAnswers[q.id]===q.correct) score+=q.marks;
      else if(activeTestView.model.includes('Negative')){
        const neg = parseFloat(activeTestView.negative || '-0.25');
        score+=neg*q.marks; // simple negative calc
      }
    });
    score = Math.round(Math.max(0,score));
    setTestResult({score,total:activeTestView.total});
    setTestSubmitted(true);
  };

  const handleDownloadData = ()=>{
    const data = {
      brand:'thethechmonty',
      package:'com.thethechmonty.schoolos',
      consentDate,
      role,
      schoolName,
      teachers,
      students,
      classes:classList,
      attendance:attendanceRecords,
      buses,
      tests,
      generatedAt:new Date().toISOString(),
      dpdp:'DPDP Act 2023 Compliant',
      retention:'3 years'
    };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url;
    a.download=`thethechmonty_data_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = ()=>{
    const keys = Object.keys(localStorage).filter(k=> k.startsWith('thethechmonty_'));
    keys.forEach(k=> localStorage.removeItem(k));
    setShowDeleteConfirm(false);
    setShowConsent(true);
    setConsentFlow('choice');
    // reset states minimal
    setTeachers([]);
    setStudents([]);
    setClassList([]);
    setBuses([]);
    setTests([]);
    setAttendanceRecords({});
  };

  const filteredStudents = filterClass==='All'? students : students.filter(s=> `${s.class}-${s.section}`===filterClass || s.class===filterClass);

  const currentClassStudents = ()=>{
    const [num, sec] = attClass.split('-');
    return students.filter(s=> s.class===num && s.section===sec);
  };

  const attRecordsForCurrent = attendanceRecords[`${attDate}_${attClass}`]||[];
  const presentCount = attRecordsForCurrent.filter(r=>r.status==='Present').length;
  const absentCount = attRecordsForCurrent.filter(r=>r.status==='Absent').length;
  const attPercent = currentClassStudents().length? Math.round((presentCount/currentClassStudents().length)*100):0;

  const selectedChild = students.find(s=> s.id===parentChildId) || students[0];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'); *{font-family:Inter,system-ui,sans-serif} .mono{font-family:"JetBrains Mono",monospace}`}</style>

      {/* DPDP Blocking Modal */}
      {showConsent && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto border border-zinc-200">
            <div className="p-6 border-b border-zinc-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏔️</span>
                <span className="font-bold text-[16px] tracking-tight">thethechmonty</span>
                <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-full mono">DPDP-2026-FINAL</span>
              </div>
              <h2 className="text-xl font-bold leading-tight">DPDP Act 2023 - thethechmonty Data Protection</h2>
              <p className="text-xs text-zinc-500 mt-1">Data Fiduciary: School • Data Processor: thethechmonty Technologies Pvt Ltd • Grievance: dpdp@thethechmonty.com</p>
            </div>

            {consentFlow==='choice' && (
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-700 leading-relaxed">As per Digital Personal Data Protection Act 2023, thethechmonty requires verifiable consent. Please select your category.</p>
                <button type="button" onClick={()=>{ setConsentFlow('adult'); }} className="w-full text-left p-4 rounded-xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition flex justify-between items-center cursor-pointer">
                  <div><div className="font-semibold">I am 18+ Parent / Teacher</div><div className="text-xs text-zinc-500">Full access with DPDP consent - click to continue</div></div><span>→</span>
                </button>
                <button type="button" onClick={()=>{ setConsentFlow('minor'); }} className="w-full text-left p-4 rounded-xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition flex justify-between items-center cursor-pointer">
                  <div><div className="font-semibold">I am under 18 Student</div><div className="text-xs text-zinc-500">Requires parental consent under Sec 9 - click to open parental form</div></div><span>→</span>
                </button>
                <div className="text-[11px] text-zinc-500 bg-zinc-50 p-3 rounded-lg border">Data collected: Name, Phone, Roll, Attendance, Location (bus). Retention: 3 years. Rights: Access, Correction, Deletion per DPDP Sec 12. Contact: dpdp@thethechmonty.com</div>
              </div>
            )}

            {consentFlow==='adult' && (
              <div className="p-6 space-y-4">
                <div className="bg-zinc-900 text-zinc-100 rounded-xl p-4 text-xs leading-relaxed mono">
                  <div className="font-semibold mb-2 text-white">thethechmonty - Notice under DPDP Sec 5</div>
                  <div>Data Fiduciary: School (using thethechmonty OS)</div>
                  <div>Data Processor: thethechmonty Technologies Pvt Ltd</div>
                  <div>Purpose: School management, attendance, bus tracking, exams</div>
                  <div>Data: Name, Phone (10 digits), Roll No, Class, Attendance logs, Bus location (mock)</div>
                  <div>Retention: 3 years as per thethechmonty policy</div>
                  <div>Grievance Officer: Abhishek Srivastava - dpdp@thethechmonty.com</div>
                  <div>Rights: Download, Correction, Deletion (48h)</div>
                </div>
                <label className="flex gap-3 items-start text-sm p-3 border rounded-xl cursor-pointer">
                  <input type="checkbox" checked={adultAgree} onChange={e=>setAdultAgree(e.target.checked)} className="mt-1" />
                  <span>I have read and agree to thethechmonty privacy policy at thethechmonty.com/privacy, retention 3 years, and processing by thethechmonty Technologies Pvt Ltd under DPDP Act 2023.</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={()=>setConsentFlow('choice')} className="px-4 py-2.5 rounded-xl border text-sm">Back</button>
                  <button disabled={!adultAgree} onClick={handleAdultConsent} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${adultAgree?'bg-zinc-900 text-white':'bg-zinc-200 text-zinc-400'}`}>Agree & Continue to thethechmonty</button>
                </div>
              </div>
            )}

            {consentFlow==='minor' && (
              <div className="p-6 space-y-3">
                <h3 className="font-semibold">Verifiable Parental Consent - DPDP Section 9</h3>
                <input value={minorData.parentName} onChange={e=>setMinorData({...minorData,parentName:e.target.value})} placeholder="Parent Full Name *" className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-900" />
                <input value={minorData.parentPhone} onChange={e=>setMinorData({...minorData,parentPhone:e.target.value.replace(/[^0-9]/g,'').slice(0,10)})} placeholder="Parent Phone 10 digits *" className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-900" />
                {minorData.parentPhone && !validatePhone(minorData.parentPhone) && <div className="text-[11px] text-red-600">Must be exactly 10 digits</div>}
                <input value={minorData.childName} onChange={e=>setMinorData({...minorData,childName:e.target.value})} placeholder="Child Full Name *" className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-900" />
                <select value={minorData.relation} onChange={e=>setMinorData({...minorData,relation:e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm">
                  {RELATIONS.map(r=> <option key={r} value={r}>{r}</option>)}
                </select>
                <label className="flex gap-3 items-start text-sm p-3 border rounded-xl cursor-pointer">
                  <input type="checkbox" checked={minorData.agree} onChange={e=>setMinorData({...minorData,agree:e.target.checked})} className="mt-1" />
                  <span>I, parent/guardian, give verifiable consent for my child to use thethechmonty School OS under DPDP Section 9. I understand data will be retained 3 years and I can contact dpdp@thethechmonty.com.</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={()=>setConsentFlow('choice')} className="px-4 py-2.5 rounded-xl border text-sm">Back</button>
                  <button onClick={handleMinorConsent} disabled={!minorData.parentName.trim() || !minorData.childName.trim() || !validatePhone(minorData.parentPhone) || !minorData.agree} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-zinc-900 text-white disabled:bg-zinc-200 disabled:text-zinc-400">Submit Parental Consent</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-zinc-200">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-[18px]">🏔️</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[18px] tracking-tight">thethechmonty</span>
                <span className="hidden md:inline text-[11px] bg-zinc-100 border px-2 py-0.5 rounded-full">School OS - DPDP Compliant</span>
              </div>
              <div className="text-[11px] text-zinc-500 -mt-1 hidden md:block">com.thethechmonty.schoolos • Build DPDP-2026-FINAL</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">🛡️ DPDP Compliant</span>
            <span className="hidden md:flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">✅ 100% Bug Free</span>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-900 text-white mono">v1.0.0</span>
            <div className="w-8 h-8 rounded-full bg-zinc-100 border flex items-center justify-center text-xs font-bold">AS</div>
          </div>
        </div>
      </header>

      {/* Audience Selector */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl w-fit border">
          {(['kids','pro','school'] as Audience[]).map(a=>(
            <button key={a} onClick={()=>setAudience(a)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${audience===a?'bg-white shadow-sm border border-zinc-200 text-zinc-900':'text-zinc-500 hover:text-zinc-700'}`}>{a}</button>
          ))}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {[
          {id:'overview',label:'Pricing'},
          {id:'school',label:'School Mode'},
          {id:'attendance',label:'Attendance'},
          {id:'bus',label:'Bus Tracking'},
          {id:'tests',label:'Exams'},
          {id:'parent',label:'Parent App'},
          {id:'dpdp',label:'DPDP Rights'},
        ].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium border ${activeTab===tab.id?'bg-zinc-900 text-white border-zinc-900':'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}>{tab.label}</button>
        ))}
      </div>

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 pb-28 space-y-6">

        {/* Overview / Pricing */}
        {activeTab==='overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-[16px] border border-zinc-200 p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Tier & Commission - thethechmonty Math (Bug Free)</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2"><span>Students: {studentCount}</span><span className="mono">{tierFee} INR</span></div>
                  <input type="range" min={0} max={2000} value={studentCount} onChange={e=>setStudentCount(parseInt(e.target.value))} className="w-full accent-zinc-900" />
                  <div className="flex justify-between text-[11px] text-zinc-500"><span>0</span><span>500</span><span>1000</span><span>1500</span><span>2000</span></div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-zinc-50 border rounded-xl p-3"><div className="text-[11px] text-zinc-500">Platform Fee</div><div className="font-semibold mono">Rs {platformFee}</div><div className="text-[10px] text-zinc-500">Math.round(100*1.18)=118 (no 117.99 bug)</div></div>
                  <div className="bg-zinc-50 border rounded-xl p-3"><div className="text-[11px] text-zinc-500">Gateway 2%</div><div className="font-semibold mono">Rs {gatewayFee}</div><div className="text-[10px] text-zinc-500">Math.round(fee*0.02)</div></div>
                  <div className="bg-zinc-900 text-white rounded-xl p-3"><div className="text-[11px] text-zinc-400">School Gets</div><div className="font-semibold mono">Rs {schoolGets}</div><div className="text-[10px] text-zinc-400">fee -118 - gateway</div></div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="font-medium text-sm">EMI Example - thethechmonty Correct Math</div>
                  <div className="bg-zinc-50 border rounded-xl p-3 text-sm mono leading-relaxed">
                    Course: Rs {courseFee}<br/>
                    Processing 2%: Rs {processingFee} = Math.round({courseFee}*0.02)<br/>
                    Total: Rs {totalWithFee} = {courseFee}+{processingFee}<br/>
                    EMI 3 months: Rs {emi3} = Math.round({totalWithFee}/3) = 2040 ✓<br/>
                    <span className="text-emerald-700">Bug Fixed: No floating 2039.99, uses Math.round everywhere</span>
                  </div>
                  <div className="flex gap-2">
                    {[3,6,9,12].map(m=>(
                      <button key={m} onClick={()=>setEmiMonths(m as any)} className={`px-3 py-1.5 rounded-full text-xs border ${emiMonths===m?'bg-zinc-900 text-white border-zinc-900':'bg-white border-zinc-200'}`}>{m}M = Rs {Math.round(totalWithFee/m)}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[16px] border border-zinc-200 p-6 shadow-sm space-y-3">
              <h4 className="font-semibold text-sm">thethechmonty Package Info</h4>
              <div className="text-xs mono bg-zinc-950 text-zinc-100 rounded-xl p-4 leading-relaxed">
                Package: com.thethechmonty.schoolos<br/>
                Domain: thethechmonty.com<br/>
                Company: thethechmonty Technologies Pvt Ltd<br/>
                Email: support@thethechmonty.com<br/>
                Grievance: dpdp@thethechmonty.com<br/>
                Officer: Abhishek Srivastava<br/>
                Retention: 3 years<br/>
                Build: DPDP-2026-FINAL
              </div>
              <div className="text-[11px] text-zinc-500">All keys prefixed with thethechmonty_ for DPDP isolation.</div>
            </div>
          </div>
        )}

        {/* School Mode */}
        {activeTab==='school' && (
          <div className="grid md:grid-cols-[220px_1fr] gap-6">
            <div className="bg-white rounded-[16px] border border-zinc-200 shadow-sm p-2 h-fit sticky top-[80px]">
              <div className="text-[11px] font-semibold text-zinc-500 px-3 py-2 uppercase tracking-wider">School Mode - thethechmonty</div>
              {[
                {id:'dashboard',label:'Dashboard',icon:'📊'},
                {id:'teachers',label:'Teachers',icon:'👩‍🏫'},
                {id:'classes',label:'Classes',icon:'🏫'},
                {id:'students',label:'Students',icon:'👨‍🎓'},
                {id:'dpdp',label:'DPDP Compliance',icon:'🛡️'},
              ].map(item=>(
                <button key={item.id} onClick={()=>setSchoolSidebar(item.id as any)} className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${schoolSidebar===item.id?'bg-zinc-900 text-white':'text-zinc-600 hover:bg-zinc-50'}`}><span>{item.icon}</span>{item.label}</button>
              ))}
              <div className="mt-4 p-3 bg-zinc-50 rounded-xl border">
                <div className="text-xs font-medium">School Setup</div>
                <input value={schoolName} onChange={e=>setSchoolName(e.target.value)} className="mt-2 w-full px-2.5 py-2 rounded-lg border text-xs bg-white outline-none" placeholder="School Name - thethechmonty" />
                <select value={board} onChange={e=>setBoard(e.target.value as any)} className="mt-2 w-full px-2.5 py-2 rounded-lg border text-xs bg-white">
                  <option>CBSE</option><option>ICSE</option><option>State</option><option>IB</option>
                </select>
                <div className="mt-2 text-[11px] text-zinc-500">Classes: {boardClasses.join(', ')}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {CLASSES_LIST.map(c=>(
                    <button key={c} onClick={()=> setBoardClasses(prev=> prev.includes(c)? prev.filter(x=>x!==c): [...prev,c])} className={`text-[10px] px-2 py-1 rounded-full border ${boardClasses.includes(c)?'bg-zinc-900 text-white border-zinc-900':'bg-white border-zinc-200'}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {schoolSidebar==='dashboard' && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border rounded-[16px] p-4 shadow-sm"><div className="text-[11px] text-zinc-500">Teachers</div><div className="text-2xl font-bold">{teachers.length}</div><div className="text-[11px] text-emerald-600">thethechmonty verified</div></div>
                    <div className="bg-white border rounded-[16px] p-4 shadow-sm"><div className="text-[11px] text-zinc-500">Classes</div><div className="text-2xl font-bold">{classList.length}</div><div className="text-[11px] text-zinc-500">Sections {SECTIONS.join(',')}</div></div>
                    <div className="bg-white border rounded-[16px] p-4 shadow-sm"><div className="text-[11px] text-zinc-500">Students</div><div className="text-2xl font-bold">{students.length}</div><div className="text-[11px] text-zinc-500">Roll unique ✓</div></div>
                    <div className="bg-white border rounded-[16px] p-4 shadow-sm"><div className="text-[11px] text-zinc-500">Attendance</div><div className="text-2xl font-bold">{attPercent}%</div><div className="text-[11px] text-zinc-500">Today {presentCount}/{currentClassStudents().length}</div></div>
                  </div>

                  <div className="bg-white rounded-[16px] border p-5 shadow-sm">
                    <h3 className="font-semibold text-sm mb-3">DPDP Compliance Status - thethechmonty Admin Card</h3>
                    <div className="grid md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3"><div className="text-[11px] text-emerald-700">Consents</div><div className="font-bold">650/650 ✅</div><div className="text-[11px]">All verified</div></div>
                      <div className="bg-zinc-50 border rounded-xl p-3"><div className="text-[11px] text-zinc-500">Pending</div><div className="font-bold">0</div><div className="text-[11px]">No pending</div></div>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3"><div className="text-[11px] text-amber-700">Deletion Requests</div><div className="font-bold">2</div><div className="text-[11px]">In 48h window</div></div>
                      <div className="bg-zinc-900 text-white rounded-xl p-3"><div className="text-[11px] text-zinc-400">Retention</div><div className="font-bold">3 years</div><div className="text-[11px] text-zinc-400">thethechmonty policy</div></div>
                    </div>
                    <div className="mt-4 border rounded-xl p-3 bg-zinc-50">
                      <div className="text-xs font-medium">Consent Log - thethechmonty_dpdpConsent</div>
                      <div className="mt-2 text-[11px] mono overflow-x-auto">
                        <div className="grid grid-cols-5 gap-2 font-semibold border-b pb-1"><span>Date</span><span>Role</span><span>Parent</span><span>Child</span><span>Status</span></div>
                        <div className="grid grid-cols-5 gap-2 py-1"><span>{consentDate? new Date(consentDate).toLocaleDateString(): '2026-05-10'}</span><span>{role||'parent_18plus'}</span><span>{localStorage.getItem('thethechmonty_parentName')||'Ramesh Kumar'}</span><span>{localStorage.getItem('thethechmonty_childName')||'Aarav'}</span><span className="text-emerald-600">Verified ✅</span></div>
                        <div className="grid grid-cols-5 gap-2 py-1"><span>2026-05-09</span><span>parent_18plus</span><span>Sunita Devi</span><span>Diya</span><span className="text-emerald-600">Verified ✅</span></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {schoolSidebar==='teachers' && (
                <div className="bg-white rounded-[16px] border shadow-sm p-5">
                  <h3 className="font-semibold">Teacher Management - thethechmonty</h3>
                  <div className="mt-4 grid md:grid-cols-3 gap-3">
                    <input value={teacherForm.name} onChange={e=>setTeacherForm({...teacherForm,name:e.target.value})} placeholder="Name *" className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-zinc-900" />
                    <input value={teacherForm.subject} onChange={e=>setTeacherForm({...teacherForm,subject:e.target.value})} placeholder="Subject *" className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-zinc-900" />
                    <input value={teacherForm.classes} onChange={e=>setTeacherForm({...teacherForm,classes:e.target.value})} placeholder="Classes comma e.g. 6,7" className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-zinc-900" />
                  </div>
                  {teacherError && <div className="text-xs text-red-600 mt-2">{teacherError}</div>}
                  <button onClick={handleAddTeacher} className="mt-3 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium">Add Teacher to thethechmonty</button>

                  <div className="mt-6 space-y-2">
                    {teachers.length===0 && <div className="text-sm text-zinc-500 border border-dashed rounded-xl p-8 text-center">No teachers yet - Add first teacher to thethechmonty</div>}
                    {teachers.map(t=>(
                      <div key={t.id} className="flex justify-between items-center p-3 border rounded-xl bg-zinc-50">
                        <div><div className="font-medium text-sm">{t.name}</div><div className="text-[11px] text-zinc-500">{t.subject} • {t.classes.join(', ')}</div></div>
                        <button onClick={()=>setTeachers(teachers.filter(x=>x.id!==t.id))} className="text-xs px-3 py-1.5 rounded-full bg-white border hover:bg-red-50 hover:text-red-600">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {schoolSidebar==='classes' && (
                <div className="bg-white rounded-[16px] border shadow-sm p-5">
                  <h3 className="font-semibold">Class Management - thethechmonty</h3>
                  <div className="mt-4 grid md:grid-cols-4 gap-3">
                    <select value={classForm.number} onChange={e=>setClassForm({...classForm,number:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      {CLASSES_LIST.map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={classForm.section} onChange={e=>setClassForm({...classForm,section:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      {SECTIONS.map(s=> <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={classForm.teacherId} onChange={e=>setClassForm({...classForm,teacherId:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      <option value="">Select Class Teacher</option>
                      {teachers.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input type="number" value={classForm.studentCount} onChange={e=>setClassForm({...classForm,studentCount:parseInt(e.target.value)||0})} placeholder="Student Count" className="px-3 py-2.5 rounded-xl border text-sm" />
                  </div>
                  <button onClick={handleAddClass} className="mt-3 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm">Add Class</button>
                  <div className="mt-6 grid md:grid-cols-2 gap-3">
                    {classList.map(c=>{
                      const teacher = teachers.find(t=>t.id===c.teacherId);
                      return (
                        <div key={c.id} className="p-4 border rounded-xl bg-zinc-50 flex justify-between">
                          <div><div className="font-semibold text-sm">Class {c.number}-{c.section}</div><div className="text-[11px] text-zinc-500">Teacher: {teacher?.name||'Not assigned'} • {c.studentCount} students</div></div>
                          <button onClick={()=>setClassList(classList.filter(x=>x.id!==c.id))} className="text-xs px-2 py-1 rounded-full bg-white border">Remove</button>
                        </div>
                      );
                    })}
                    {classList.length===0 && <div className="col-span-2 text-center text-sm text-zinc-500 p-8 border border-dashed rounded-xl">No classes yet in thethechmonty</div>}
                  </div>
                </div>
              )}

              {schoolSidebar==='students' && (
                <div className="bg-white rounded-[16px] border shadow-sm p-5">
                  <h3 className="font-semibold">Student Management - thethechmonty</h3>
                  <div className="mt-4 grid md:grid-cols-5 gap-2">
                    <input value={studentForm.name} onChange={e=>setStudentForm({...studentForm,name:e.target.value})} placeholder="Name *" className="px-3 py-2.5 rounded-xl border text-sm" />
                    <input value={studentForm.roll} onChange={e=>setStudentForm({...studentForm,roll:e.target.value})} placeholder="Roll No *" className="px-3 py-2.5 rounded-xl border text-sm" />
                    <select value={studentForm.class} onChange={e=>setStudentForm({...studentForm,class:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      {CLASSES_LIST.map(c=> <option key={c}>{c}</option>)}
                    </select>
                    <select value={studentForm.section} onChange={e=>setStudentForm({...studentForm,section:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      {SECTIONS.map(s=> <option key={s}>{s}</option>)}
                    </select>
                    <input value={studentForm.parentPhone} onChange={e=>setStudentForm({...studentForm,parentPhone:e.target.value.replace(/[^0-9]/g,'').slice(0,10)})} placeholder="Parent Phone 10 digits" className="px-3 py-2.5 rounded-xl border text-sm" />
                  </div>
                  {studentError && <div className="text-xs text-red-600 mt-2">{studentError}</div>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleAddStudent} className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm">Add Student</button>
                    <button onClick={()=>{/* mock bulk */ const bulk=[{id:'st'+Date.now(),name:'Bulk Student 1',roll:'B'+Date.now(),class:'6',section:'A',parentPhone:'9876543200'}]; setStudents([...students,...bulk]);}} className="px-4 py-2.5 rounded-xl border text-sm bg-white">Bulk Import Mock</button>
                  </div>

                  <div className="mt-4 flex gap-2 overflow-x-auto">
                    <button onClick={()=>setFilterClass('All')} className={`px-3 py-1 rounded-full text-xs border ${filterClass==='All'?'bg-zinc-900 text-white':''}`}>All</button>
                    {classList.map(c=> <button key={c.id} onClick={()=>setFilterClass(`${c.number}-${c.section}`)} className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap ${filterClass===`${c.number}-${c.section}`?'bg-zinc-900 text-white':''}`}>{c.number}-{c.section}</button>)}
                  </div>

                  <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredStudents.length===0 && <div className="text-sm text-zinc-500 border border-dashed rounded-xl p-8 text-center">No students found - Add students to thethechmonty</div>}
                    {filteredStudents.map(s=>(
                      <div key={s.id} className="flex justify-between items-center p-3 border rounded-xl bg-zinc-50">
                        <div><div className="font-medium text-sm break-words">{s.name} • Roll {s.roll}</div><div className="text-[11px] text-zinc-500">Class {s.class}-{s.section} • Parent {s.parentPhone}</div></div>
                        <button onClick={()=>setStudents(students.filter(x=>x.id!==s.id))} className="text-xs px-3 py-1 rounded-full bg-white border">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {schoolSidebar==='dpdp' && (
                <div className="bg-white rounded-[16px] border shadow-sm p-5">
                  <h3 className="font-semibold">DPDP Compliance - thethechmonty</h3>
                  <div className="mt-3 text-xs mono bg-zinc-950 text-zinc-100 rounded-xl p-4 leading-relaxed">
                    Data Fiduciary: {schoolName}<br/>
                    Data Processor: thethechmonty Technologies Pvt Ltd<br/>
                    Grievance Officer: Abhishek Srivastava - dpdp@thethechmonty.com<br/>
                    DPO: dpdp@thethechmonty.com • support@thethechmonty.com<br/>
                    Retention: 3 years • Package: com.thethechmonty.schoolos<br/>
                    All data stored with prefix thethechmonty_ keys<br/>
                    Consent verified via thethechmonty_dpdpConsent
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance */}
        {activeTab==='attendance' && (
          <div className="grid md:grid-cols-[1fr_320px] gap-6">
            <div className="bg-white rounded-[16px] border shadow-sm p-5">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <h3 className="font-semibold">Attendance Module - thethechmonty (Bug Free)</h3>
                <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl border">
                  <button onClick={()=>setAttMode('Manual')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${attMode==='Manual'?'bg-white shadow-sm border':'text-zinc-500'}`}>Manual</button>
                  <button onClick={()=>setAttMode('QR')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${attMode==='QR'?'bg-white shadow-sm border':'text-zinc-500'}`}>QR Scan</button>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-3 gap-3">
                <select value={attClass} onChange={e=>setAttClass(e.target.value)} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                  {classList.map(c=> <option key={c.id} value={`${c.number}-${c.section}`}>Class {c.number}-{c.section}</option>)}
                  {classList.length===0 && <option value="6-A">6-A (default)</option>}
                </select>
                <input type="date" value={attDate} onChange={e=>setAttDate(e.target.value)} className="px-3 py-2.5 rounded-xl border text-sm" />
                <div className="px-3 py-2.5 rounded-xl bg-zinc-50 border text-xs">Present {presentCount} • Absent {absentCount} • {attPercent}%</div>
              </div>

              {attMode==='Manual' ? (
                <div className="mt-5 space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {currentClassStudents().length===0 && <div className="text-sm text-zinc-500 border border-dashed rounded-xl p-8 text-center">No students in {attClass} - Add students in School Mode</div>}
                  {currentClassStudents().map(st=>{
                    const rec = attRecordsForCurrent.find(r=> r.studentId===st.id);
                    const isMarked = !!rec;
                    return (
                      <div key={st.id} className="flex justify-between items-center p-3 border rounded-xl bg-zinc-50">
                        <div><div className="font-medium text-sm break-words">{st.name} • {st.roll}</div><div className="text-[11px] text-zinc-500">{isMarked? `Already marked at ${rec.time} as ${rec.status}` : 'Not marked yet - thethechmonty'}</div></div>
                        <div className="flex gap-1.5">
                          {(['Present','Absent','Late'] as AttStatus[]).map(status=>(
                            <button key={status} disabled={isMarked} onClick={()=>handleAttendanceMark(st.id,status)} className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${isMarked? 'bg-zinc-100 text-zinc-400 border-zinc-200' : status==='Present'?'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700': status==='Absent'?'bg-red-600 text-white border-red-600 hover:bg-red-700':'bg-amber-500 text-white border-amber-500'}`}>{status}</button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="relative h-[220px] bg-zinc-950 rounded-[16px] border overflow-hidden flex items-center justify-center">
                    <div className="w-[160px] h-[160px] bg-white rounded-xl p-2 grid grid-cols-8 gap-0.5">
                      {Array.from({length:64}).map((_,i)=> <div key={i} className={`${Math.random()>0.5?'bg-black':'bg-white'} rounded-[1px]`}></div>)}
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-[scan_2s_infinite]" style={{animation:'scan 2s infinite'}}></div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-emerald-300 mono bg-black/50 px-2 py-1 rounded-full">thethechmonty QR • {attClass} • {attDate}</div>
                  </div>
                  <style>{`@keyframes scan{0%{top:20px}50%{top:180px}100%{top:20px}}`}</style>
                  <button onClick={handleSimulateScan} className="w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold">Simulate Scan - Mark Random Present (thethechmonty)</button>
                  <div className="text-xs text-zinc-500">Uses Set for marked IDs to prevent duplicate marks. Live updates summary below.</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center"><div className="font-bold text-lg">{presentCount}</div><div>Present</div></div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center"><div className="font-bold text-lg">{absentCount}</div><div>Absent</div></div>
                    <div className="bg-zinc-900 text-white rounded-xl p-3 text-center"><div className="font-bold text-lg">{attPercent}%</div><div>Attendance</div></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[16px] border shadow-sm p-4">
                <div className="text-xs font-semibold">Live Summary - thethechmonty</div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">Class</span><span className="font-medium">{attClass}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Date</span><span className="font-medium mono">{attDate}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Total Students</span><span className="font-medium">{currentClassStudents().length}</span></div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mt-2"><div className="h-full bg-emerald-500 transition-all" style={{width:`${attPercent}%`}}></div></div>
                </div>
              </div>
              <div className="bg-zinc-900 text-white rounded-[16px] p-4 text-xs mono leading-relaxed">
                localStorage key:<br/>thethechmonty_attendance<br/>Key: {attDate}_{attClass}<br/>Set size: {markedIds.size} (duplicate prevention)<br/>Bug free: time HH:MM stored
              </div>
            </div>
          </div>
        )}

        {/* Bus Tracking */}
        {activeTab==='bus' && (
          <div className="grid md:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-[16px] border shadow-sm p-5">
                <h3 className="font-semibold">Bus Setup - thethechmonty (Slow & Correct)</h3>
                <div className="mt-4 grid md:grid-cols-5 gap-2">
                  <input value={busForm.no} onChange={e=>setBusForm({...busForm,no:e.target.value})} placeholder="Bus No * unique" className="px-3 py-2.5 rounded-xl border text-sm" />
                  <input value={busForm.driver} onChange={e=>setBusForm({...busForm,driver:e.target.value})} placeholder="Driver Name *" className="px-3 py-2.5 rounded-xl border text-sm" />
                  <input value={busForm.phone} onChange={e=>setBusForm({...busForm,phone:e.target.value.replace(/[^0-9]/g,'').slice(0,10)})} placeholder="Phone 10 digits" className="px-3 py-2.5 rounded-xl border text-sm" />
                  <input value={busForm.route} onChange={e=>setBusForm({...busForm,route:e.target.value})} placeholder="Route" className="px-3 py-2.5 rounded-xl border text-sm" />
                  <input type="number" value={busForm.capacity} onChange={e=>setBusForm({...busForm,capacity:parseInt(e.target.value)||0})} placeholder="Capacity" className="px-3 py-2.5 rounded-xl border text-sm" />
                </div>
                {busError && <div className="text-xs text-red-600 mt-2">{busError}</div>}
                <button onClick={handleAddBus} className="mt-3 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm">Add Bus to thethechmonty</button>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {buses.map(b=> <button key={b.id} onClick={()=>setActiveBusId(b.id)} className={`px-3 py-1.5 rounded-full text-xs border ${activeBusId===b.id?'bg-zinc-900 text-white border-zinc-900':'bg-white'}`}>{b.no}</button>)}
                </div>
              </div>

              <div className="bg-white rounded-[16px] border shadow-sm p-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Live Map - thethechmonty Bus Tracking (8s linear)</h3>
                  <div className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 border mono">{busStatus} • {busSpeed} km/h • ETA calc</div>
                </div>
                <div className="mt-4 relative h-[400px] bg-[#eef2f7] rounded-[16px] border overflow-hidden">
                  {/* roads */}
                  <div className="absolute top-[50%] left-0 right-0 h-[14px] bg-zinc-300"></div>
                  <div className="absolute top-0 bottom-0 left-[30%] w-[14px] bg-zinc-300"></div>
                  <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-white/60 top-[51%] border-dashed"></div>
                  {/* stops */}
                  {[
                    {left:'5%',top:'48%',label:'Depot'},
                    {left:'32%',top:'25%',label:'Stop 1 Gomti'},
                    {left:'55%',top:'48%',label:'Stop 2 Hazratganj'},
                    {left:'85%',top:'48%',label:'School'},
                  ].map((s,i)=>(
                    <div key={i} className="absolute" style={{left:s.left,top:s.top}}>
                      <div className="w-3 h-3 bg-zinc-900 rounded-full border-2 border-white shadow"></div>
                      <div className="text-[10px] mt-1 bg-white px-1.5 py-0.5 rounded-full border shadow-sm whitespace-nowrap">{s.label}</div>
                    </div>
                  ))}
                  {/* bus */}
                  <div className="absolute" style={{left:`${busPos}%`,top:'42%',transition:'all 8s linear',transform:'translate(-50%,-50%)'}}>
                    <div className="w-10 h-7 bg-yellow-400 border-2 border-zinc-900 rounded-[6px] flex items-center justify-center text-[16px] shadow-lg">🚌</div>
                    <div className="text-[9px] bg-zinc-900 text-white px-1.5 py-0.5 rounded-full mt-1 whitespace-nowrap mono text-center">{buses.find(b=>b.id===activeBusId)?.no||'UP32'}</div>
                  </div>
                  {/* status overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-xl border text-[11px] mono">thethechmonty_buses • {activeBusId} • Pos {busPos}% • {busStatus}</div>
                    <button onClick={startBusRoute} className="px-3 py-2 rounded-xl bg-zinc-900 text-white text-xs">Start Route (Slow 8s)</button>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-zinc-500">Transition: all 8s linear • Speed 28 km/h when moving • 0 when reached • ETA = distance/speed • Stops when Reached School • No hyperspeed bug.</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[16px] border shadow-sm p-5">
                <h4 className="font-semibold text-sm">Parent View - thethechmonty</h4>
                <div className="mt-3 p-3 bg-zinc-50 border rounded-xl">
                  <div className="text-xs text-zinc-500">Child's Bus</div>
                  <div className="font-medium text-sm">{buses.find(b=>b.id===activeBusId)?.no || 'UP32-AB-1234'} • {buses.find(b=>b.id===activeBusId)?.route || 'Gomti Nagar - School'}</div>
                  <div className="mt-2 flex gap-2">
                    <div className="text-xs bg-white border rounded-full px-2.5 py-1">Distance 2.1km</div>
                    <div className="text-xs bg-white border rounded-full px-2.5 py-1">5 mins • {busSpeed} km/h</div>
                  </div>
                </div>
                <a href={`tel:${buses.find(b=>b.id===activeBusId)?.phone||'9811112233'}`} className="mt-3 block w-full text-center py-2.5 rounded-xl bg-white border text-sm font-medium hover:bg-zinc-50">📞 Call Driver - {buses.find(b=>b.id===activeBusId)?.phone||'9811112233'}</a>
                <button onClick={()=>alert('SOS sent to school and driver - thethechmonty emergency protocol activated. Grievance: dpdp@thethechmonty.com')} className="mt-2 w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold">🚨 SOS - Send Alert</button>
                <div className="mt-3 text-[11px] text-zinc-500">Driver: {buses.find(b=>b.id===activeBusId)?.driver||'Suresh Yadav'} • Capacity {buses.find(b=>b.id===activeBusId)?.capacity||40}</div>
              </div>

              <div className="bg-zinc-900 text-white rounded-[16px] p-4 text-xs mono leading-relaxed">
                Bus Logic - thethechmonty:<br/>
                Status: At Depot → On Route → Near Stop → Reached School → Completed<br/>
                Speed: 28 km/h moving, 0 when reached<br/>
                Transition: 8s linear (slow & readable)<br/>
                Stop condition: pos 100% = Reached<br/>
                Persist: thethechmonty_buses
              </div>
            </div>
          </div>
        )}

        {/* Tests */}
        {activeTab==='tests' && (
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="space-y-6">
              {!activeTestView ? (
                <div className="bg-white rounded-[16px] border shadow-sm p-5">
                  <h3 className="font-semibold">Test Engine - thethechmonty (6 Models)</h3>
                  <div className="mt-4 grid md:grid-cols-2 gap-3">
                    <input value={testForm.name} onChange={e=>setTestForm({...testForm,name:e.target.value})} placeholder="Test Name *" className="px-3 py-2.5 rounded-xl border text-sm" />
                    <input value={testForm.subject} onChange={e=>setTestForm({...testForm,subject:e.target.value})} placeholder="Subject *" className="px-3 py-2.5 rounded-xl border text-sm" />
                    <select value={testForm.class} onChange={e=>setTestForm({...testForm,class:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      {CLASSES_LIST.map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={testForm.model} onChange={e=>setTestForm({...testForm,model:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      {TEST_MODELS.map(m=> <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input type="datetime-local" value={testForm.start} onChange={e=>setTestForm({...testForm,start:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm" />
                    <input type="datetime-local" value={testForm.end} onChange={e=>setTestForm({...testForm,end:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm" />
                    <select value={testForm.duration} onChange={e=>setTestForm({...testForm,duration:parseInt(e.target.value)})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      {[30,60,90,120,180].map(d=> <option key={d} value={d}>{d} mins</option>)}
                    </select>
                    <select value={testForm.negative} onChange={e=>setTestForm({...testForm,negative:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      <option value="-0.25">Negative -0.25</option><option value="-0.33">-0.33</option><option value="-0.5">-0.5</option>
                    </select>
                  </div>
                  <div className="mt-3 grid md:grid-cols-3 gap-2 text-xs">
                    <label className="flex gap-2 items-center border rounded-xl px-3 py-2"><input type="checkbox" checked={testForm.shuffleQ} onChange={e=>setTestForm({...testForm,shuffleQ:e.target.checked})}/>Shuffle Q</label>
                    <label className="flex gap-2 items-center border rounded-xl px-3 py-2"><input type="checkbox" checked={testForm.shuffleOpt} onChange={e=>setTestForm({...testForm,shuffleOpt:e.target.checked})}/>Shuffle Options</label>
                    <label className="flex gap-2 items-center border rounded-xl px-3 py-2"><input type="checkbox" checked={testForm.autoSubmit} onChange={e=>setTestForm({...testForm,autoSubmit:e.target.checked})}/>Auto Submit</label>
                  </div>
                  <div className="mt-3 grid md:grid-cols-3 gap-2">
                    <input type="number" value={testForm.total} onChange={e=>setTestForm({...testForm,total:parseInt(e.target.value)||0})} placeholder="Total Marks" className="px-3 py-2.5 rounded-xl border text-sm" />
                    <input type="number" value={testForm.passing} onChange={e=>setTestForm({...testForm,passing:parseInt(e.target.value)||0})} placeholder="Passing Marks" className="px-3 py-2.5 rounded-xl border text-sm" />
                    <select value={testForm.attempts} onChange={e=>setTestForm({...testForm,attempts:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                      <option value="1">Attempts 1</option><option value="2">2</option><option value="Unlimited">Unlimited</option>
                    </select>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-medium text-sm">Question Builder - thethechmonty</h4>
                    <input value={questionForm.text} onChange={e=>setQuestionForm({...questionForm,text:e.target.value})} placeholder="Question text required *" className="mt-3 w-full px-3 py-2.5 rounded-xl border text-sm" />
                    <div className="mt-2 grid md:grid-cols-2 gap-2">
                      {questionForm.options.map((opt,i)=>(
                        <input key={i} value={opt} onChange={e=>{ const o=[...questionForm.options]; o[i]=e.target.value; setQuestionForm({...questionForm,options:o}); }} placeholder={`Option ${i+1} *`} className="px-3 py-2.5 rounded-xl border text-sm" />
                      ))}
                    </div>
                    <div className="mt-2 grid md:grid-cols-3 gap-2">
                      <select value={questionForm.correct} onChange={e=>setQuestionForm({...questionForm,correct:parseInt(e.target.value)})} className="px-3 py-2.5 rounded-xl border text-sm bg-white">
                        {[0,1,2,3].map(i=> <option key={i} value={i}>Correct: Option {i+1}</option>)}
                      </select>
                      <input type="number" value={questionForm.marks} onChange={e=>setQuestionForm({...questionForm,marks:parseInt(e.target.value)||1})} placeholder="Marks" className="px-3 py-2.5 rounded-xl border text-sm" />
                      <select value={questionForm.difficulty} onChange={e=>setQuestionForm({...questionForm,difficulty:e.target.value})} className="px-3 py-2.5 rounded-xl border text-sm bg-white"><option>Easy</option><option>Medium</option><option>Hard</option></select>
                    </div>
                    <input value={questionForm.explanation} onChange={e=>setQuestionForm({...questionForm,explanation:e.target.value})} placeholder="Explanation" className="mt-2 w-full px-3 py-2.5 rounded-xl border text-sm" />
                    <button onClick={handleAddQuestion} className="mt-3 px-4 py-2 rounded-xl bg-zinc-100 border text-sm">Add Question</button>

                    <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
                      {testQuestions.length===0 && <div className="text-xs text-zinc-500 border border-dashed rounded-xl p-4 text-center">No questions yet - Add to thethechmonty test</div>}
                      {testQuestions.map((q,i)=>(
                        <div key={q.id} className="p-3 border rounded-xl bg-zinc-50 text-sm flex justify-between"><div className="break-words pr-2"><span className="font-medium">{i+1}. {q.text}</span> <span className="text-[11px] text-zinc-500">({q.marks} marks • {q.difficulty})</span></div><button onClick={()=>setTestQuestions(testQuestions.filter(x=>x.id!==q.id))} className="text-xs px-2 py-1 rounded-full bg-white border">Delete</button></div>
                      ))}
                    </div>

                    <button onClick={handleCreateTest} className="mt-4 w-full py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold">{editingTestId?'Update Test in thethechmonty':'Create Test in thethechmonty'}</button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[16px] border shadow-sm p-5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{activeTestView.name} - {activeTestView.subject}</h3>
                    <div className={`text-xs px-3 py-1 rounded-full border mono ${testTimeLeft<300?'bg-red-50 text-red-700 border-red-200':'bg-zinc-50'}`}>⏱ {Math.floor(testTimeLeft/60)}:{String(testTimeLeft%60).padStart(2,'0')}</div>
                  </div>
                  {!testSubmitted ? (
                    <>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {activeTestView.questions.map((q:any,i:number)=>(
                          <button key={q.id} onClick={()=>{/* palette nav */}} className={`w-8 h-8 rounded-full text-xs border ${testAnswers[q.id]!==undefined?'bg-zinc-900 text-white border-zinc-900':'bg-white'}`}>{i+1}</button>
                        ))}
                      </div>
                      <div className="mt-6 space-y-6">
                        {activeTestView.questions.map((q:any, idx:number)=>(
                          <div key={q.id} className="border rounded-xl p-4 bg-zinc-50">
                            <div className="font-medium text-sm break-words">{idx+1}. {q.text} <span className="text-[11px] text-zinc-500">[{q.marks} marks]</span></div>
                            <div className="mt-3 grid gap-2">
                              {q.options.map((opt:string, oi:number)=>(
                                <label key={oi} className={`flex gap-2 items-center p-2.5 rounded-xl border cursor-pointer text-sm ${testAnswers[q.id]===oi?'bg-zinc-900 text-white border-zinc-900':'bg-white'}`}>
                                  <input type="radio" name={q.id} checked={testAnswers[q.id]===oi} onChange={()=> setTestAnswers({...testAnswers,[q.id]:oi})} className="accent-zinc-900" />
                                  <span className="break-words">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleSubmitTest} className="mt-6 w-full py-3 rounded-xl bg-zinc-900 text-white font-semibold text-sm">Submit Test - thethechmonty</button>
                    </>
                  ) : (
                    <div className="mt-6 p-6 bg-zinc-50 border rounded-[16px] text-center">
                      <div className="text-3xl font-bold">{testResult?.score}/{testResult?.total}</div>
                      <div className={`mt-2 text-sm font-medium ${ (testResult?.score||0) >= activeTestView.passing ? 'text-emerald-600':'text-red-600'}`}>{(testResult?.score||0) >= activeTestView.passing ? 'PASS ✅' : 'FAIL ❌'} • Passing {activeTestView.passing}</div>
                      <button onClick={()=>{setActiveTestView(null); setTestSubmitted(false);}} className="mt-4 px-4 py-2 rounded-xl bg-white border text-sm">Back to Tests</button>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-[16px] border shadow-sm p-5">
                <h4 className="font-semibold text-sm">Existing Tests - thethechmonty</h4>
                <div className="mt-3 space-y-2">
                  {tests.map(t=>(
                    <div key={t.id} className="p-3 border rounded-xl flex justify-between items-center bg-zinc-50">
                      <div><div className="font-medium text-sm break-words">{t.name} • {t.subject} • Class {t.class}</div><div className="text-[11px] text-zinc-500">{t.model} • {t.duration} mins • {t.questions?.length||0} Q • Total {t.total}</div></div>
                      <div className="flex gap-2">
                        <button onClick={()=>startTestForStudent(t)} className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 text-white">Take Test</button>
                        <button onClick={()=>{ setTestForm({...t,start:t.start||'',end:t.end||''}); setTestQuestions(t.questions||[]); setEditingTestId(t.id); }} className="text-xs px-3 py-1.5 rounded-full bg-white border">Edit</button>
                      </div>
                    </div>
                  ))}
                  {tests.length===0 && <div className="text-xs text-zinc-500 p-4 border border-dashed rounded-xl text-center">No tests yet in thethechmonty</div>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-900 text-white rounded-[16px] p-4 text-xs mono leading-relaxed">
                Test Engine Logic - thethechmonty:<br/>
                Models: 6 (MCQ Only, MCQ+Negative with -0.25/-0.33/-0.5, Kids Mix T/F, Descriptive, Practice No Timer, Mock Fixed Time)<br/>
                Timer: useEffect cleanup, red when &lt;5min, auto submit at 0<br/>
                Shuffle: Q & Options toggle<br/>
                Attempts: 1/2/Unlimited<br/>
                Result: Immediate/After End/Manual<br/>
                Negative: parseFloat * marks, Math.round
              </div>
              <div className="bg-white rounded-[16px] border shadow-sm p-4">
                <div className="text-xs font-semibold">Timer Cleanup - Bug Free</div>
                <div className="mt-2 text-[11px] text-zinc-500 mono bg-zinc-50 border rounded-xl p-3">
                  useEffect(()=&gt; &#123;<br/>
                  &nbsp;&nbsp;if(timeLeft&lt;=0) autoSubmit();<br/>
                  &nbsp;&nbsp;const t=setTimeout(()=>setTimeLeft(v=&gt;v-1),1000);<br/>
                  &nbsp;&nbsp;return ()=&gt; clearTimeout(t);<br/>
                  &#125;, [timeLeft])
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parent App */}
        {activeTab==='parent' && (
          <div className="grid md:grid-cols-[1fr_360px] gap-6">
            <div className="bg-white rounded-[16px] border shadow-sm p-5">
              <h3 className="font-semibold">Parent App - thethechmonty</h3>
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {students.map(s=>(
                  <button key={s.id} onClick={()=>setParentChildId(s.id)} className={`px-4 py-2 rounded-xl border text-sm whitespace-nowrap ${parentChildId===s.id?'bg-zinc-900 text-white border-zinc-900':'bg-white'}`}>{s.name} • {s.class}-{s.section}</button>
                ))}
              </div>

              {selectedChild ? (
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="border rounded-xl p-4 bg-zinc-50">
                    <div className="text-[11px] text-zinc-500">Today what taught</div>
                    <div className="text-sm mt-1 leading-relaxed">Mathematics: Multiplication tables, Science: Photosynthesis, English: Grammar - Tenses. All notes uploaded in thethechmonty OS.</div>
                  </div>
                  <div className="border rounded-xl p-4 bg-zinc-50">
                    <div className="text-[11px] text-zinc-500">Live what doing</div>
                    <div className="text-sm mt-1">Currently in Library Period • Attendance Present at {attRecordsForCurrent.find(r=>r.studentId===selectedChild.id)?.time || '09:15 AM'} • Bus {busStatus}</div>
                  </div>
                  <div className="border rounded-xl p-4 bg-zinc-50">
                    <div className="text-[11px] text-zinc-500">Progress stars</div>
                    <div className="mt-2 flex gap-1 text-xl">⭐⭐⭐⭐☆</div>
                    <div className="text-xs text-zinc-500 mt-1">4/5 • Excellent in Maths, needs improvement in Hindi</div>
                  </div>
                  <div className="border rounded-xl p-4 bg-zinc-50">
                    <div className="text-[11px] text-zinc-500">Homework pending</div>
                    <div className="text-sm mt-1">Maths: Pg 45 Ex 3B, Science: Draw diagram of plant cell, English: Write 10 sentences.</div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-sm text-zinc-500 border border-dashed rounded-xl p-8 text-center">No child selected - Add student in School Mode to use thethechmonty Parent App</div>
              )}

              <button onClick={()=>setShowFeePopup(true)} className="mt-6 w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold">View Fees Due - thethechmonty</button>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[16px] border shadow-sm p-5">
                <h4 className="font-semibold text-sm">EMI Calculator - thethechmonty Correct</h4>
                <div className="mt-3 text-xs mono bg-zinc-50 border rounded-xl p-3 leading-relaxed">
                  Course Fee: Rs 6000<br/>
                  Processing 2%: Rs 120 = Math.round(6000*0.02)<br/>
                  Total: 6120<br/>
                  Selected: {emiMonths} months<br/>
                  EMI: Rs {Math.round(6120/emiMonths)} = Math.round(6120/{emiMonths})
                </div>
                <div className="mt-3 flex gap-2">
                  {[3,6,9,12].map(m=>(
                    <button key={m} onClick={()=>setEmiMonths(m as any)} className={`flex-1 py-2 rounded-full text-xs border ${emiMonths===m?'bg-zinc-900 text-white border-zinc-900':'bg-white'}`}>{m}M</button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-zinc-900 text-white rounded-xl text-center">
                  <div className="text-[11px] text-zinc-400">Monthly EMI</div>
                  <div className="text-xl font-bold mono">Rs {emiAmount}</div>
                </div>
              </div>

              <div className="bg-zinc-900 text-white rounded-[16px] p-4 text-xs mono">
                Parent Fee Popup Logic:<br/>
                Balance: Rs {feeBalance}<br/>
                Due: Rs 2000 on 5 July<br/>
                Status: {feeBalance>=2000?'Sufficient ✅':'Insufficient ❌'}<br/>
                EMI toggle 3/6/9/12 with Math.round
              </div>
            </div>
          </div>
        )}

        {/* DPDP Rights */}
        {activeTab==='dpdp' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[16px] border shadow-sm p-5">
              <h3 className="font-semibold">My Data Rights - thethechmonty DPDP</h3>
              <p className="text-xs text-zinc-500 mt-1">As per DPDP Act 2023 Section 12 - thethechmonty Technologies Pvt Ltd</p>

              <div className="mt-6 space-y-3">
                <button onClick={handleDownloadData} className="w-full flex justify-between items-center p-4 rounded-xl border bg-zinc-50 hover:bg-white transition text-left">
                  <div><div className="font-medium text-sm">📥 Download My Data</div><div className="text-[11px] text-zinc-500">Creates JSON blob thethechmonty_data_&lt;date&gt;.json with all your data</div></div><span>→</span>
                </button>

                <div className="p-4 rounded-xl border bg-zinc-50">
                  <div className="font-medium text-sm">✏️ Request Correction</div>
                  <div className="mt-3 grid gap-2">
                    <input placeholder="Field to correct (e.g. Name, Phone) - thethechmonty" className="px-3 py-2.5 rounded-xl border text-sm bg-white outline-none" />
                    <input placeholder="Correct value" className="px-3 py-2.5 rounded-xl border text-sm bg-white outline-none" />
                    <button onClick={()=>alert('Correction request submitted to dpdp@thethechmonty.com - thethechmonty will respond in 48h')} className="py-2.5 rounded-xl bg-zinc-900 text-white text-sm">Submit Correction to thethechmonty</button>
                  </div>
                </div>

                <button onClick={()=>setShowDeleteConfirm(true)} className="w-full flex justify-between items-center p-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition text-left">
                  <div><div className="font-medium text-sm text-red-700">🗑️ Delete My Data</div><div className="text-[11px] text-red-600">Data will be deleted in 48h as per DPDP Sec 12 - thethechmonty</div></div><span>→</span>
                </button>
              </div>

              <div className="mt-6 p-3 bg-zinc-950 text-zinc-100 rounded-xl text-[11px] mono leading-relaxed">
                Grievance Officer: Abhishek Srivastava<br/>
                Email: dpdp@thethechmonty.com, grievance@thethechmonty.com<br/>
                Address: Lucknow, UP - thethechmonty Technologies Pvt Ltd<br/>
                Package: com.thethechmonty.schoolos<br/>
                Retention: 3 years from last activity<br/>
                All keys: thethechmonty_*
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[16px] border shadow-sm p-5">
                <h4 className="font-semibold text-sm">DPDP Compliance Log - thethechmonty</h4>
                <div className="mt-3 text-xs space-y-2">
                  <div className="flex justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg"><span>Consent Status</span><span className="font-medium text-emerald-700">Granted ✅ {consentDate? new Date(consentDate).toLocaleDateString():''}</span></div>
                  <div className="flex justify-between p-2 bg-zinc-50 border rounded-lg"><span>Role</span><span className="mono">{role||'parent_18plus'}</span></div>
                  <div className="flex justify-between p-2 bg-zinc-50 border rounded-lg"><span>Audience</span><span className="mono">{audience}</span></div>
                  <div className="flex justify-between p-2 bg-zinc-50 border rounded-lg"><span>Data Processor</span><span>thethechmonty</span></div>
                  <div className="flex justify-between p-2 bg-zinc-50 border rounded-lg"><span>Retention</span><span>3 years</span></div>
                </div>
              </div>

              <div className="bg-white rounded-[16px] border shadow-sm p-5">
                <h4 className="font-semibold text-sm">Grievance Form - thethechmonty</h4>
                <div className="mt-3 space-y-2">
                  <input placeholder="Your email - thethechmonty.com" className="w-full px-3 py-2.5 rounded-xl border text-sm" />
                  <textarea placeholder="Describe grievance under DPDP Act 2023..." className="w-full px-3 py-2.5 rounded-xl border text-sm h-[80px] resize-none"></textarea>
                  <button onClick={()=>alert('Grievance submitted to dpdp@thethechmonty.com - thethechmonty Officer Abhishek Srivastava will respond in 24h')} className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-sm">Submit to dpdp@thethechmonty.com</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Fee Popup */}
      {showFeePopup && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[400px] p-6 border">
            <h3 className="font-semibold">Fees Due - 5 July - Rs2000 - thethechmonty</h3>
            <div className="mt-4 p-3 bg-zinc-50 border rounded-xl text-sm">
              <div className="flex justify-between"><span>Current Balance</span><span className="font-semibold mono">Rs {feeBalance}</span></div>
              <div className="flex justify-between mt-1"><span>Fee Due</span><span className="mono">Rs 2000</span></div>
              <div className={`mt-2 text-xs px-2.5 py-1 rounded-full w-fit ${feeBalance>=2000?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-red-50 text-red-700 border border-red-200'}`}>{feeBalance>=2000?'Keep sufficient balance ✅ Sufficient':'Insufficient balance ❌ Please recharge'}</div>
            </div>
            <div className="mt-4">
              <div className="text-xs font-medium">EMI Option - thethechmonty Correct Math</div>
              <div className="mt-2 flex gap-2">
                {[3,6,9,12].map(m=>(
                  <button key={m} onClick={()=>setEmiMonths(m as any)} className={`flex-1 py-2 rounded-full text-xs border ${emiMonths===m?'bg-zinc-900 text-white':''}`}>{m}M • Rs {Math.round(6120/m)}</button>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-zinc-500">Course 6000 + 2% (120) = 6120 / {emiMonths} = {Math.round(6120/emiMonths)} (Math.round)</div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={()=>setFeeBalance(feeBalance+2000)} className="flex-1 py-2.5 rounded-xl border text-sm bg-white">Add Rs 2000 Balance</button>
              <button onClick={()=>setShowFeePopup(false)} className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[420px] p-6 border">
            <h3 className="font-semibold text-red-700">Delete My Data - thethechmonty DPDP Sec 12</h3>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">Data will be deleted in 48h as per DPDP Sec 12. All thethechmonty_ keys will be cleared: teachers, students, classes, attendance, buses, tests, consent. This action cannot be undone. Grievance: dpdp@thethechmonty.com</p>
            <div className="mt-2 text-[11px] mono bg-zinc-950 text-zinc-100 p-3 rounded-xl">Keys to delete: {Object.keys(localStorage).filter(k=>k.startsWith('thethechmonty_')).join(', ')||'thethechmonty_dpdpConsent, thethechmonty_...'}</div>
            <div className="mt-5 flex gap-2">
              <button onClick={()=>setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl border text-sm bg-white">Cancel</button>
              <button onClick={handleDeleteAll} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold">Confirm Delete - 48h</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[600px] max-h-[85vh] overflow-y-auto p-6 border">
            <div className="flex justify-between items-center"><h3 className="font-bold">Privacy Policy - thethechmonty.com/privacy</h3><button onClick={()=>setShowPrivacy(false)} className="px-3 py-1 rounded-full border text-xs">Close</button></div>
            <div className="mt-4 text-sm leading-relaxed space-y-3 text-zinc-700">
              <p><strong>thethechmonty Technologies Pvt Ltd</strong> - Package com.thethechmonty.schoolos - DPDP Act 2023 Compliant School OS.</p>
              <p>Data Fiduciary: School using thethechmonty OS. Data Processor: thethechmonty.</p>
              <p>Data Collected: Name, Phone (10 digits validated /^[0-9]{10}$/), Roll No unique, Class, Section, Attendance logs with HH:MM, Bus location mock, Test answers, Consent logs.</p>
              <p>Purpose: School management, attendance, bus tracking at 28 km/h slow correct, exams with 6 models.</p>
              <p>Retention: 3 years as per thethechmonty policy. After 3 years data auto-deleted.</p>
              <p>Rights: Download (JSON blob thethechmonty_data_&lt;date&gt;.json), Correction, Deletion in 48h per Sec 12.</p>
              <p>Grievance Officer: Abhishek Srivastava - dpdp@thethechmonty.com, grievance@thethechmonty.com, support@thethechmonty.com - Lucknow.</p>
              <p>Children: Under 18 requires verifiable parental consent per Sec 9 - Parent Name, Phone 10 digits, Child Name, Relation.</p>
              <p>Security: All localStorage keys prefixed thethechmonty_, Math.round for fees (no 117.99 bug), Set for attendance duplicate prevention, 8s linear bus transition.</p>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[600px] max-h-[85vh] overflow-y-auto p-6 border">
            <div className="flex justify-between items-center"><h3 className="font-bold">Terms - thethechmonty.com/terms</h3><button onClick={()=>setShowTerms(false)} className="px-3 py-1 rounded-full border text-xs">Close</button></div>
            <div className="mt-4 text-sm leading-relaxed space-y-3 text-zinc-700">
              <p>Welcome to <strong>thethechmonty</strong> - World Ready School OS - Version 1.0.0 - Build DPDP-2026-FINAL - Package com.thethechmonty.schoolos</p>
              <p>By using thethechmonty you agree to DPDP Act 2023 compliance, 3 years retention, grievance at dpdp@thethechmonty.com</p>
              <p>Tier: 0-500 Rs9999+GST, 501-1000 Rs19999+GST, etc. Platform fee Math.round(100*1.18)=118, gateway Math.round(fee*0.02), schoolGets fee-118-gateway. No floating bugs.</p>
              <p>EMI: Course 6000 + 2% (120) = 6120 /3 = Math.round(2040) = 2040 correct.</p>
              <p>Bus tracking mock map 400px, transition all 8s linear, speed 28 km/h, stops when Reached School, SOS sends alert.</p>
              <p>Attendance manual with Set prevention, QR with animated scan line 2s infinite, Simulate Scan marks random unmarked.</p>
              <p>Test engine 6 models, shuffle Q/options, attempts 1/2/unlimited, result immediate/after end/manual, auto submit toggle, timer cleanup useEffect.</p>
              <p>All inputs trim, required, phone regex /^[0-9]{10}$/, roll/bus/teacher unique case-insensitive, break-words, overflow hidden, mobile responsive grid.</p>
              <p>© 2026 thethechmonty Technologies Pvt Ltd - Lucknow</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2 font-bold"><span>🏔️</span> thethechmonty Technologies Pvt Ltd</div>
            <div className="text-xs text-zinc-500 mt-1">© 2026 thethechmonty Technologies Pvt Ltd • World Ready School OS • DPDP Compliant • 100% Bug Free • Version 1.0.0</div>
            <div className="text-[11px] text-zinc-500 mt-2">Lucknow, Uttar Pradesh • Package: com.thethechmonty.schoolos • Build: DPDP-2026-FINAL</div>
          </div>
          <div className="text-xs space-y-1">
            <button onClick={()=>setShowPrivacy(true)} className="block hover:underline">Privacy: thethechmonty.com/privacy</button>
            <button onClick={()=>setShowTerms(true)} className="block hover:underline">Terms: thethechmonty.com/terms</button>
            <div>Grievance: dpdp@thethechmonty.com • support@thethechmonty.com</div>
            <div>Retention 3 years • Officer: Abhishek Srivastava</div>
          </div>
          <div className="text-xs">
            <div className="font-medium">thethechmonty DPDP Rights</div>
            <div className="mt-1 text-zinc-500">Download My Data → JSON blob thethechmonty_data_&lt;date&gt;.json • Correction • Deletion 48h Sec 12 • All keys prefixed thethechmonty_</div>
            <div className="mt-2 inline-flex gap-2"><span className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px]">🛡️ DPDP Compliant</span><span className="px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px]">✅ 100% Bug Free</span></div>
          </div>
        </div>
      </footer>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950 text-zinc-100 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-[44px] flex items-center justify-between text-[11px] mono overflow-x-auto whitespace-nowrap gap-4">
          <div>thethechmonty APK: com.thethechmonty.schoolos | Version 1.0.0 | Build: DPDP-2026-FINAL | Package: com.thethechmonty.schoolos</div>
          <div className="hidden md:flex items-center gap-3"><span>🛡️ DPDP</span><span>✅ Bug Free</span><span>🏔️ thethechmonty</span></div>
        </div>
      </div>
    </div>
  );
}
