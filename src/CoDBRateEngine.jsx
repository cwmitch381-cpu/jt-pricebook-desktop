import { useState, useMemo } from "react";

const COST_CATEGORIES = [
  { key: "techLabor", label: "Technician Labor", desc: "Wages + burden (taxes, WC, benefits)", icon: "◆", priority: "P0" },
  { key: "nonRevLabor", label: "Non-Revenue Labor", desc: "Office, dispatch, GM salaries", icon: "◆", priority: "P0" },
  { key: "vehicles", label: "Vehicle Costs", desc: "Fuel, insurance, maintenance, GPS", icon: "◆", priority: "P1" },
  { key: "facility", label: "Facility Costs", desc: "Rent, utilities, shop supplies", icon: "◆", priority: "P1" },
  { key: "insurance", label: "Insurance & Licensing", desc: "GL, bonding, permits (monthly)", icon: "◆", priority: "P1" },
  { key: "marketing", label: "Marketing & Advertising", desc: "Digital, print, sponsorships", icon: "◆", priority: "P2" },
  { key: "tools", label: "Tools & Equipment", desc: "Depreciation / replacement (monthly)", icon: "◆", priority: "P2" },
  { key: "software", label: "Software & Technology", desc: "CRM, SaaS, phones, tablets", icon: "◆", priority: "P2" },
  { key: "admin", label: "Administrative & Misc", desc: "Supplies, uniforms, training, legal", icon: "◆", priority: "P3" },
  { key: "ownerComp", label: "Owner's Compensation", desc: "Your pay — salary + benefits + retirement", icon: "★", priority: "P0", layer: 1 },
  { key: "warrantyReserve", label: "Warranty / Callback Reserve", desc: "Budget for unbilled return trips", icon: "★", priority: "P0", layer: 1 },
  { key: "taxReserve", label: "Tax Reserve", desc: "Quarterly estimated taxes (monthly set-aside)", icon: "★", priority: "P0", layer: 1 },
  { key: "debtService", label: "Debt Service", desc: "Equipment financing, vehicle loans, LOC", icon: "★", priority: "P0", layer: 1 },
  { key: "cultureEvents", label: "Team Events & Culture", desc: "Quarterly outings, holiday parties, team meals", icon: "▲", priority: "P1", layer: 3 },
  { key: "trainingCerts", label: "Training & Certifications", desc: "EPA, NATE, manufacturer training, continuing ed", icon: "▲", priority: "P1", layer: 3 },
];

const SAMPLE_PRICEBOOK = [
  { id: 1, name: "Drain Cleaning — Standard", hours: 1.5, matCost: 45 },
  { id: 2, name: "Water Heater Install — 50 Gal Gas", hours: 4, matCost: 595 },
  { id: 3, name: "Toilet Replace — Standard", hours: 1.5, matCost: 165 },
  { id: 4, name: "Faucet Install — Kitchen", hours: 2, matCost: 185 },
  { id: 5, name: "Garbage Disposal Install", hours: 1.5, matCost: 210 },
  { id: 6, name: "Sewer Camera Inspection", hours: 1, matCost: 15 },
  { id: 7, name: "Water Line Repair", hours: 3, matCost: 120 },
  { id: 8, name: "Gas Line Leak Repair", hours: 2.5, matCost: 95 },
  { id: 9, name: "Tankless WH Install", hours: 6, matCost: 1150 },
  { id: 10, name: "Hydro Jetting", hours: 2, matCost: 35 },
  { id: 11, name: "Sump Pump Install", hours: 3, matCost: 280 },
  { id: 12, name: "Repipe — Whole House (PEX)", hours: 16, matCost: 1800 },
  { id: 13, name: "Backflow Test & Cert", hours: 1, matCost: 10 },
  { id: 14, name: "Leak Detection — Electronic", hours: 1.5, matCost: 5 },
  { id: 15, name: "CIPP Liner — 4\" Main", hours: 8, matCost: 2200 },
  { id: 16, name: "AC Diagnostic — Residential", hours: 1.5, matCost: 20 },
  { id: 17, name: "Furnace Tune-Up", hours: 1.5, matCost: 35 },
  { id: 18, name: "AC Compressor Replace", hours: 4, matCost: 1400 },
  { id: 19, name: "Furnace Inducer Motor Replace", hours: 2.5, matCost: 380 },
  { id: 20, name: "Mini Split Install — Single Zone", hours: 6, matCost: 1650 },
  { id: 21, name: "Panel Upgrade — 200A", hours: 8, matCost: 1200 },
  { id: 22, name: "Outlet / Switch Install", hours: 1, matCost: 25 },
  { id: 23, name: "Ceiling Fan Install", hours: 1.5, matCost: 45 },
  { id: 24, name: "EV Charger Install — Level 2", hours: 4, matCost: 650 },
  { id: 25, name: "Whole Home Rewire", hours: 24, matCost: 3200 },
];

const MARKUP_TIERS = [
  [100, 4.0], [300, 3.5], [750, 3.0], [1500, 2.5], [3000, 2.25],
  [5000, 2.0], [7500, 1.75], [10000, 1.6], [Infinity, 1.5],
];

function getMarkup(matCost) {
  for (const [ceil, mult] of MARKUP_TIERS) {
    if (matCost <= ceil) return mult;
  }
  return 1.5;
}

const HISTORICAL_RATES = [
  { month: "Oct '25", rate: 327, costs: 48200 },
  { month: "Nov '25", rate: 334, costs: 49100 },
  { month: "Dec '25", rate: 341, costs: 48800 },
  { month: "Jan '26", rate: 338, costs: 49900 },
  { month: "Feb '26", rate: 345, costs: 50200 },
  { month: "Mar '26", rate: 352, costs: 51800 },
];

// ─── COLORS ──────────────────────────
const C = {
  black: "#06060a",
  blackLight: "#0c0c12",
  blackCard: "#111118",
  blackHover: "#18181f",
  red: "#dc2626",
  redBright: "#ef4444",
  redDark: "#991b1b",
  redGlow: "rgba(220,38,38,0.15)",
  redSubtle: "rgba(220,38,38,0.06)",
  white: "#ffffff",
  white90: "rgba(255,255,255,0.92)",
  white70: "rgba(255,255,255,0.72)",
  white50: "rgba(255,255,255,0.52)",
  white30: "rgba(255,255,255,0.36)",
  white15: "rgba(255,255,255,0.18)",
  white08: "rgba(255,255,255,0.08)",
  white04: "rgba(255,255,255,0.04)",
  white02: "rgba(255,255,255,0.02)",
  green: "#22c55e",
  greenSub: "rgba(34,197,94,0.1)",
  amber: "#f59e0b",
  amberSub: "rgba(245,158,11,0.1)",
  blue: "#3b82f6",
  blueSub: "rgba(59,130,246,0.1)",
};

export default function CoDBRateEngine() {
  const [activeTab, setActiveTab] = useState("command");
  const [approved, setApproved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [adjustMode, setAdjustMode] = useState(false);

  const [settings, setSettings] = useState({
    numTechs: 5, hoursPerDay: 8, efficiencyRate: 65,
    profitMargin: 20, holidays: 1,
  });

  const [revenue, setRevenue] = useState({
    monthlyTarget: 125000,
    avgTicketTarget: 650,
    membershipRevenue: 8500,
    numTrucks: 5,
    // Dispatch Board Targets
    avgServiceTicket: 450,
    avgInstallTicket: 4200,
    // Per-department avg tickets
    plumbingServiceTicket: 425,
    plumbingInstallTicket: 3800,
    hvacServiceTicket: 485,
    hvacInstallTicket: 5200,
    electricalServiceTicket: 375,
    electricalInstallTicket: 2800,
    installMixPct: 20, // % of jobs that are installs
    closeRate: 72, // % of booked calls that convert to sold jobs
    avgCallsPerSlot: 1, // calls per dispatch slot (for daily board math)
  });

  const updateRevenue = (key, val) => setRevenue(prev => ({ ...prev, [key]: val === '' || val === null ? 0 : (parseFloat(val) || 0) }));

  // Manual board inputs — dispatcher enters these daily
  const [board, setBoard] = useState({
    plumbingService: 3,
    plumbingInstall: 1,
    hvacService: 2,
    hvacInstall: 1,
    electricalService: 1,
    electricalInstall: 0,
  });
  const updateBoard = (key, val) => setBoard(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));

  // Manual daily call targets — what you NEED on the board
  const [targets, setTargets] = useState({
    serviceCalls: 6,
    installCalls: 2,
    soldJobs: 6,
    dailyRevenue: 5952,
  });
  const updateTarget = (key, val) => setTargets(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));

  const [costs, setCosts] = useState({
    techLabor: 28500, nonRevLabor: 8200, vehicles: 4800,
    facility: 3200, insurance: 1800, marketing: 3500,
    tools: 900, software: 650, admin: 1200,
    ownerComp: 12500, warrantyReserve: 1800, taxReserve: 4200, debtService: 3100,
    cultureEvents: 800, trainingCerts: 1200,
  });

  const [lastUpdated] = useState({
    techLabor: 2, nonRevLabor: 2, vehicles: 5, facility: 30,
    insurance: 45, marketing: 3, tools: 60, software: 15, admin: 25,
    ownerComp: 1, warrantyReserve: 5, taxReserve: 1, debtService: 10,
    cultureEvents: 15, trainingCerts: 20,
  });

  // ═══ LAYER 3 — Strategic Intelligence ═══
  const [deptSplit, setDeptSplit] = useState({
    plumbingPct: 40,
    hvacPct: 35,
    electricalPct: 25,
    plumbingTechs: 2,
    hvacTechs: 2,
    electricalTechs: 1,
  });
  const updateDeptSplit = (key, val) => setDeptSplit(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));

  const [seasonal, setSeasonal] = useState({
    Jan: 75, Feb: 80, Mar: 90, Apr: 100, May: 110,
    Jun: 120, Jul: 130, Aug: 125, Sep: 110, Oct: 95, Nov: 85, Dec: 70,
  });

  const [acquisition, setAcquisition] = useState({
    newCustomersPerMonth: 45,
    repeatCustomerPct: 35,
  });

  // ═══ P&L BENCHMARKS — Industry Standards ═══
  const [benchmarks, setBenchmarks] = useState({
    techLabor: [20, 25],
    nonRevLabor: [8, 12],
    vehicles: [4, 6],
    facility: [3, 5],
    insurance: [2, 3],
    marketing: [5, 10],
    tools: [1, 2],
    software: [1, 2],
    admin: [2, 4],
    ownerComp: [8, 12],
    warrantyReserve: [1, 2],
    taxReserve: [3, 5],
    debtService: [2, 4],
    cultureEvents: [0.5, 1.5],
    trainingCerts: [1, 2],
    netProfit: [10, 20],
  });

  // ═══ CASH FLOW TIMING ═══
  const [cashFlow, setCashFlow] = useState({
    current0to30: 42000,
    aging31to60: 12500,
    aging61to90: 4800,
    aging90plus: 2200,
    avgDaysToCollect: 28,
  });
  const updateCashFlow = (key, val) => setCashFlow(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  const totalReceivables = cashFlow.current0to30 + cashFlow.aging31to60 + cashFlow.aging61to90 + cashFlow.aging90plus;
  const collectiblePct = totalReceivables > 0 ? ((cashFlow.current0to30 + cashFlow.aging31to60) / totalReceivables * 100) : 0;
  const atRiskReceivables = cashFlow.aging61to90 + cashFlow.aging90plus;

  // ═══ MEMBERSHIP HEALTH ═══
  const [membership, setMembership] = useState({
    totalMembers: 185,
    newThisMonth: 12,
    cancelledThisMonth: 4,
    dueForService: 28,
    avgRevenuePerMember: 46,
    annualRenewalRate: 82,
  });
  const updateMembership = (key, val) => setMembership(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  const memberChurnRate = membership.totalMembers > 0 ? (membership.cancelledThisMonth / membership.totalMembers * 100) : 0;
  const memberNetGrowth = membership.newThisMonth - membership.cancelledThisMonth;
  const memberLTV = membership.avgRevenuePerMember * 12 * (membership.annualRenewalRate / 100) * 3;
  const memberAnnualRevenue = membership.totalMembers * membership.avgRevenuePerMember * 12;

  // ═══ KPI ALERT THRESHOLDS ═══
  const [kpiAlerts, setKpiAlerts] = useState({
    minCloseRate: 65,
    maxMarketingPct: 10,
    minAvgTicket: 400,
    maxCallbackPct: 5,
    minDailyRevenue: 4500,
    maxAgingOver60: 10000,
  });
  const updateKpiAlert = (key, val) => setKpiAlerts(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));

  const currentMonth = "April 2026";
  const workDaysInMonth = 22 - settings.holidays;

  const totalCosts = useMemo(() => Object.values(costs).reduce((s, v) => s + v, 0), [costs]);
  const billableHours = useMemo(() =>
    settings.numTechs * workDaysInMonth * settings.hoursPerDay * (settings.efficiencyRate / 100),
    [settings, workDaysInMonth]);
  const breakeven = useMemo(() => billableHours > 0 ? totalCosts / billableHours : 0, [totalCosts, billableHours]);
  const trueHourlyRate = useMemo(() => breakeven * (1 + settings.profitMargin / 100), [breakeven, settings.profitMargin]);

  const prevRate = HISTORICAL_RATES[HISTORICAL_RATES.length - 1]?.rate || 0;
  const rateDelta = prevRate > 0 ? ((trueHourlyRate - prevRate) / prevRate * 100) : 0;
  const bigSwing = Math.abs(rateDelta) > 20;

  const avg3 = useMemo(() => {
    const l = HISTORICAL_RATES.slice(-3);
    return l.reduce((s, h) => s + h.rate, 0) / l.length;
  }, []);
  const avg6 = useMemo(() => HISTORICAL_RATES.reduce((s, h) => s + h.rate, 0) / HISTORICAL_RATES.length, []);

  const pricebookImpact = useMemo(() => {
    return SAMPLE_PRICEBOOK.map(item => {
      const markup = getMarkup(item.matCost);
      const markedUpMat = item.matCost * markup;
      const newPrice = Math.round(markedUpMat + (item.hours * trueHourlyRate));
      const oldPrice = Math.round(markedUpMat + (item.hours * prevRate));
      const change = newPrice - oldPrice;
      const changePct = oldPrice > 0 ? (change / oldPrice * 100) : 0;
      return { ...item, newPrice, oldPrice, change, changePct, flagged: Math.abs(changePct) >= 10 };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }, [trueHourlyRate, prevRate]);

  const flaggedCount = pricebookImpact.filter(i => i.flagged).length;
  const avgChange = pricebookImpact.length > 0
    ? pricebookImpact.reduce((s, i) => s + Math.abs(i.changePct), 0) / pricebookImpact.length : 0;

  const dataAlerts = useMemo(() => {
    const alerts = [];
    COST_CATEGORIES.forEach(cat => {
      const days = lastUpdated[cat.key];
      if (costs[cat.key] === 0) alerts.push({ key: cat.key, label: cat.label, type: "missing", msg: "No data entered" });
      else if (days > 60) alerts.push({ key: cat.key, label: cat.label, type: "stale", msg: `Last updated ${days} days ago` });
      else if (days > 30) alerts.push({ key: cat.key, label: cat.label, type: "estimated", msg: `Using rolling average (${days}d old)` });
    });
    return alerts;
  }, [costs, lastUpdated]);

  const costPctData = useMemo(() => {
    return COST_CATEGORIES.map(cat => ({
      ...cat, value: costs[cat.key],
      pct: totalCosts > 0 ? (costs[cat.key] / totalCosts * 100) : 0,
    })).sort((a, b) => b.value - a.value);
  }, [costs, totalCosts]);

  // Layer 1 Intelligence — Hidden Cost Recovery
  const layer1Keys = useMemo(() => ["ownerComp", "warrantyReserve", "taxReserve", "debtService"], []);
  const layer1Total = useMemo(() => layer1Keys.reduce((s, k) => s + costs[k], 0), [costs, layer1Keys]);
  const costsWithoutLayer1 = totalCosts - layer1Total;
  const rateWithoutLayer1 = useMemo(() =>
    billableHours > 0 ? (costsWithoutLayer1 / billableHours) * (1 + settings.profitMargin / 100) : 0,
    [costsWithoutLayer1, billableHours, settings.profitMargin]);
  const layer1RateImpact = trueHourlyRate - rateWithoutLayer1;
  const layer1PctOfCosts = totalCosts > 0 ? (layer1Total / totalCosts * 100) : 0;

  // Per-job impact of Layer 1 (based on avg job hours)
  const avgJobHours = useMemo(() => {
    const total = SAMPLE_PRICEBOOK.reduce((s, i) => s + i.hours, 0);
    return total / SAMPLE_PRICEBOOK.length;
  }, []);
  const layer1PerJobImpact = layer1RateImpact * avgJobHours;

  // Annual Layer 1 recovery (what you'd lose yearly without these costs accounted for)
  const layer1AnnualRecovery = layer1Total * 12;

  // ═══ LAYER 2 — Revenue Reality Check ═══
  const revenuePerTech = settings.numTechs > 0 ? revenue.monthlyTarget / settings.numTechs : 0;
  const revenuePerTruck = revenue.numTrucks > 0 ? revenue.monthlyTarget / revenue.numTrucks : 0;
  const requiredJobs = revenue.avgTicketTarget > 0 ? Math.ceil(revenue.monthlyTarget / revenue.avgTicketTarget) : 0;
  const jobsPerTechPerDay = (settings.numTechs > 0 && workDaysInMonth > 0)
    ? requiredJobs / settings.numTechs / workDaysInMonth : 0;
  const membershipPctOfRevenue = revenue.monthlyTarget > 0
    ? (revenue.membershipRevenue / revenue.monthlyTarget * 100) : 0;
  const nonMembershipRevenue = revenue.monthlyTarget - revenue.membershipRevenue;
  const requiredJobsAfterMembership = revenue.avgTicketTarget > 0
    ? Math.ceil(nonMembershipRevenue / revenue.avgTicketTarget) : 0;
  const jobsSavedByMembership = requiredJobs - requiredJobsAfterMembership;
  const netAfterCosts = revenue.monthlyTarget - totalCosts;
  const netMarginActual = revenue.monthlyTarget > 0 ? (netAfterCosts / revenue.monthlyTarget * 100) : 0;
  const annualRevTarget = revenue.monthlyTarget * 12;
  const annualNetProfit = netAfterCosts * 12;
  // Revenue capacity check — can your team physically generate enough billable hours to hit target?
  const maxRevenueCapacity = billableHours * trueHourlyRate;
  const capacityUtilization = maxRevenueCapacity > 0 ? (revenue.monthlyTarget / maxRevenueCapacity * 100) : 0;
  const revenueGapOrSurplus = maxRevenueCapacity - revenue.monthlyTarget;
  const capacityStatus = capacityUtilization > 100 ? "OVER" : capacityUtilization > 85 ? "TIGHT" : "OK";

  // ═══ DISPATCH BOARD MATH ═══
  const serviceCallPct = 100 - revenue.installMixPct;
  const closeRateDecimal = revenue.closeRate / 100;

  // Blended avg ticket from mix (weighted)
  const blendedAvgTicket = (revenue.avgServiceTicket * (serviceCallPct / 100)) + (revenue.avgInstallTicket * (revenue.installMixPct / 100));

  // Revenue needed from non-membership jobs
  const revFromJobs = revenue.monthlyTarget - revenue.membershipRevenue;

  // Total sold jobs needed per month
  const totalSoldJobsNeeded = blendedAvgTicket > 0 ? Math.ceil(revFromJobs / blendedAvgTicket) : 0;

  // Install vs service breakdown (sold jobs)
  const installJobsNeeded = Math.ceil(totalSoldJobsNeeded * (revenue.installMixPct / 100));
  const serviceJobsNeeded = totalSoldJobsNeeded - installJobsNeeded;

  // Revenue from each type
  const revenueFromInstalls = installJobsNeeded * revenue.avgInstallTicket;
  const revenueFromService = serviceJobsNeeded * revenue.avgServiceTicket;

  // Calls on the board BEFORE close rate (you need more calls than sold jobs)
  const totalCallsOnBoard = closeRateDecimal > 0 ? Math.ceil(totalSoldJobsNeeded / closeRateDecimal) : 0;
  const installCallsOnBoard = closeRateDecimal > 0 ? Math.ceil(installJobsNeeded / closeRateDecimal) : 0;
  const serviceCallsOnBoard = totalCallsOnBoard - installCallsOnBoard;

  // Daily dispatch board targets
  const callsPerDay = workDaysInMonth > 0 ? totalCallsOnBoard / workDaysInMonth : 0;
  const callsPerTechPerDay = settings.numTechs > 0 ? callsPerDay / settings.numTechs : 0;
  const installCallsPerDay = workDaysInMonth > 0 ? installCallsOnBoard / workDaysInMonth : 0;
  const serviceCallsPerDay = workDaysInMonth > 0 ? serviceCallsOnBoard / workDaysInMonth : 0;

  // Weekly dispatch board targets (5-day work week)
  const weeksInMonth = workDaysInMonth / 5;
  const callsPerWeek = weeksInMonth > 0 ? totalCallsOnBoard / weeksInMonth : 0;
  const serviceCallsPerWeek = weeksInMonth > 0 ? serviceCallsOnBoard / weeksInMonth : 0;
  const installCallsPerWeek = weeksInMonth > 0 ? installCallsOnBoard / weeksInMonth : 0;
  const soldJobsPerWeek = weeksInMonth > 0 ? totalSoldJobsNeeded / weeksInMonth : 0;

  // Daily revenue target
  const dailyRevenueTarget = workDaysInMonth > 0 ? revenue.monthlyTarget / workDaysInMonth : 0;
  const weeklyRevenueTarget = weeksInMonth > 0 ? revenue.monthlyTarget / weeksInMonth : 0;

  // ═══ MANUAL BOARD — Revenue Projections from actual board inputs ═══
  // Daily totals from 6-way split
  const boardPlumbingDaily = board.plumbingService + board.plumbingInstall;
  const boardHvacDaily = board.hvacService + board.hvacInstall;
  const boardElectricalDaily = board.electricalService + board.electricalInstall;
  const boardServiceDaily = board.plumbingService + board.hvacService + board.electricalService;
  const boardInstallDaily = board.plumbingInstall + board.hvacInstall + board.electricalInstall;
  const boardTotalDaily = boardPlumbingDaily + boardHvacDaily + boardElectricalDaily;
  const boardTotalWeekly = boardTotalDaily * 5;
  const boardTotalMonthly = boardTotalDaily * workDaysInMonth;

  // Sold jobs from board (after close rate) — per category
  const boardSoldPlumbSvc = board.plumbingService * closeRateDecimal;
  const boardSoldPlumbInst = board.plumbingInstall * closeRateDecimal;
  const boardSoldHvacSvc = board.hvacService * closeRateDecimal;
  const boardSoldHvacInst = board.hvacInstall * closeRateDecimal;
  const boardSoldElecSvc = board.electricalService * closeRateDecimal;
  const boardSoldElecInst = board.electricalInstall * closeRateDecimal;
  const boardSoldServiceDaily = boardSoldPlumbSvc + boardSoldHvacSvc + boardSoldElecSvc;
  const boardSoldInstallDaily = boardSoldPlumbInst + boardSoldHvacInst + boardSoldElecInst;
  const boardSoldTotalDaily = boardSoldServiceDaily + boardSoldInstallDaily;

  // Revenue projections from board — per category using dept-specific tickets
  const boardRevPlumbSvc = boardSoldPlumbSvc * revenue.plumbingServiceTicket;
  const boardRevPlumbInst = boardSoldPlumbInst * revenue.plumbingInstallTicket;
  const boardRevHvacSvc = boardSoldHvacSvc * revenue.hvacServiceTicket;
  const boardRevHvacInst = boardSoldHvacInst * revenue.hvacInstallTicket;
  const boardRevElecSvc = boardSoldElecSvc * revenue.electricalServiceTicket;
  const boardRevElecInst = boardSoldElecInst * revenue.electricalInstallTicket;
  const boardRevPlumbingDaily = boardRevPlumbSvc + boardRevPlumbInst;
  const boardRevHvacDaily = boardRevHvacSvc + boardRevHvacInst;
  const boardRevElectricalDaily = boardRevElecSvc + boardRevElecInst;
  const boardRevServiceDaily = boardRevPlumbSvc + boardRevHvacSvc + boardRevElecSvc;
  const boardRevInstallDaily = boardRevPlumbInst + boardRevHvacInst + boardRevElecInst;
  const boardRevTotalDaily = boardRevPlumbingDaily + boardRevHvacDaily + boardRevElectricalDaily;
  const boardRevTotalWeekly = boardRevTotalDaily * 5;
  const boardRevTotalMonthly = boardRevTotalDaily * workDaysInMonth;

  // Weekly/Monthly sold jobs from board
  const boardSoldServiceWeekly = boardSoldServiceDaily * 5;
  const boardSoldInstallWeekly = boardSoldInstallDaily * 5;
  const boardSoldServiceMonthly = boardSoldServiceDaily * workDaysInMonth;
  const boardSoldInstallMonthly = boardSoldInstallDaily * workDaysInMonth;

  // Pace comparison — projected vs target
  const boardVsTarget = boardRevTotalMonthly - revenue.monthlyTarget;
  const boardVsTargetPct = revenue.monthlyTarget > 0 ? (boardVsTarget / revenue.monthlyTarget * 100) : 0;
  const boardPaceStatus = boardVsTargetPct >= 0 ? "ON PACE" : boardVsTargetPct > -10 ? "CLOSE" : "BEHIND";

  // ═══ BREAKEVEN DAY CALCULATOR ═══
  const breakevenWorkDays = boardRevTotalDaily > 0 ? totalCosts / boardRevTotalDaily : workDaysInMonth;
  const breakevenCalendarDay = Math.min(Math.ceil(breakevenWorkDays * (30 / workDaysInMonth)), 30);
  const profitDays = workDaysInMonth - Math.ceil(breakevenWorkDays);
  const profitDaysCalendar = 30 - breakevenCalendarDay;
  const dailyProfitAfterBreakeven = boardRevTotalDaily; // every dollar after breakeven is profit
  const remainingProfitProjection = profitDays > 0 ? profitDays * boardRevTotalDaily - 0 : 0;
  const breakevenPct = workDaysInMonth > 0 ? (breakevenWorkDays / workDaysInMonth) * 100 : 0;

  // "At this pace" projector — month-end projection from today's board
  const projectedMonthRevenue = boardRevTotalMonthly;
  const projectedMonthProfit = projectedMonthRevenue - totalCosts;
  const projectedMargin = projectedMonthRevenue > 0 ? (projectedMonthProfit / projectedMonthRevenue * 100) : 0;

  // ═══ WHAT-IF SIMULATOR ═══
  const [whatIf, setWhatIf] = useState({
    addTechs: 0,
    ticketBump: 0,
    closeRateAdj: 0,
    efficiencyAdj: 0,
  });
  const updateWhatIf = (key, val) => setWhatIf(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  const resetWhatIf = () => setWhatIf({ addTechs: 0, ticketBump: 0, closeRateAdj: 0, efficiencyAdj: 0 });

  // What-if calculations
  const wiTechs = settings.numTechs + whatIf.addTechs;
  const wiEfficiency = Math.min(settings.efficiencyRate + whatIf.efficiencyAdj, 100);
  const wiCloseRate = Math.min(revenue.closeRate + whatIf.closeRateAdj, 100) / 100;
  const wiHours = wiTechs * workDaysInMonth * settings.hoursPerDay * (wiEfficiency / 100);
  const wiRate = wiHours > 0 ? (totalCosts / wiHours) * (1 + settings.profitMargin / 100) : 0;

  // What-if board revenue (same board calls but with adjusted close rate + ticket bump)
  const wiSoldTotal = boardTotalDaily * wiCloseRate;
  const wiAvgTicketBumped = (boardRevTotalDaily / (boardSoldTotalDaily || 1)) + whatIf.ticketBump;
  const wiDailyRev = wiSoldTotal * wiAvgTicketBumped;
  const wiMonthlyRev = wiDailyRev * workDaysInMonth;
  const wiMonthlyProfit = wiMonthlyRev - totalCosts;
  const wiBreakevenDays = wiDailyRev > 0 ? totalCosts / wiDailyRev : workDaysInMonth;
  const wiBreakevenCalDay = Math.min(Math.ceil(wiBreakevenDays * (30 / workDaysInMonth)), 30);

  // Deltas from current
  const wiRateDelta = wiRate - trueHourlyRate;
  const wiRevDelta = wiMonthlyRev - projectedMonthRevenue;
  const wiProfitDelta = wiMonthlyProfit - projectedMonthProfit;
  const wiBreakevenDelta = wiBreakevenCalDay - breakevenCalendarDay;

  // ═══ P&L BENCHMARK ANALYSIS ═══
  const benchmarkRevenue = projectedMonthRevenue > 0 ? projectedMonthRevenue : revenue.monthlyTarget;
  const plData = useMemo(() => {
    const items = COST_CATEGORIES.map(cat => {
      const actual = costs[cat.key] || 0;
      const pctOfRev = benchmarkRevenue > 0 ? (actual / benchmarkRevenue * 100) : 0;
      const bm = benchmarks[cat.key] || [0, 100];
      const low = bm[0]; const high = bm[1];
      let status = "OK";
      if (pctOfRev < low * 0.7) status = "UNDER";
      else if (pctOfRev < low) status = "LOW";
      else if (pctOfRev > high * 1.3) status = "OVER";
      else if (pctOfRev > high) status = "HIGH";
      return { ...cat, actual, pctOfRev, low, high, status };
    });
    const totalCostPct = benchmarkRevenue > 0 ? (totalCosts / benchmarkRevenue * 100) : 0;
    const netProfitPct = 100 - totalCostPct;
    const profitBm = benchmarks.netProfit;
    let profitStatus = "OK";
    if (netProfitPct < profitBm[0] * 0.5) profitStatus = "CRITICAL";
    else if (netProfitPct < profitBm[0]) profitStatus = "LOW";
    else if (netProfitPct > profitBm[1]) profitStatus = "STRONG";
    const overCount = items.filter(i => i.status === "OVER" || i.status === "HIGH").length;
    const underCount = items.filter(i => i.status === "UNDER" || i.status === "LOW").length;
    const okCount = items.filter(i => i.status === "OK").length;
    return { items, totalCostPct, netProfitPct, profitStatus, profitBm, overCount, underCount, okCount };
  }, [costs, benchmarkRevenue, benchmarks]);

  // ═══ KPI ALERT TRIGGERS ═══
  const marketingPctOfRev = benchmarkRevenue > 0 ? (costs.marketing / benchmarkRevenue * 100) : 0;
  const activeAlerts = useMemo(() => {
    const alerts = [];
    const cr = revenue.closeRate;
    if (cr < kpiAlerts.minCloseRate) alerts.push({ label: "Close Rate Below Threshold", value: `${cr}%`, threshold: `${kpiAlerts.minCloseRate}%`, severity: "HIGH" });
    if (marketingPctOfRev > kpiAlerts.maxMarketingPct) alerts.push({ label: "Marketing Spend Over Limit", value: `${marketingPctOfRev.toFixed(1)}%`, threshold: `${kpiAlerts.maxMarketingPct}%`, severity: "MEDIUM" });
    if (boardRevTotalDaily < kpiAlerts.minDailyRevenue) alerts.push({ label: "Daily Revenue Below Target", value: fmtD(Math.round(boardRevTotalDaily)), threshold: fmtD(kpiAlerts.minDailyRevenue), severity: "HIGH" });
    if (atRiskReceivables > kpiAlerts.maxAgingOver60) alerts.push({ label: "Receivables Aging Over 60 Days", value: fmtD(atRiskReceivables), threshold: fmtD(kpiAlerts.maxAgingOver60), severity: "HIGH" });
    if (memberChurnRate > 3) alerts.push({ label: "Membership Churn Elevated", value: `${memberChurnRate.toFixed(1)}%/mo`, threshold: "< 3%/mo", severity: "MEDIUM" });
    return alerts;
  }, [revenue.closeRate, marketingPctOfRev, boardRevTotalDaily, atRiskReceivables, memberChurnRate, kpiAlerts]);

  // ═══ MONTHLY SCORECARD ═══
  const scorecard = useMemo(() => {
    const items = [
      { label: "Revenue vs Target", actual: projectedMonthRevenue, target: revenue.monthlyTarget, isMoney: true },
      { label: "Net Profit Margin", actual: plData.netProfitPct, target: benchmarks.netProfit[0], suffix: "%", invert: false },
      { label: "Close Rate", actual: revenue.closeRate, target: kpiAlerts.minCloseRate, suffix: "%" },
      { label: "Breakeven Day", actual: breakevenCalendarDay, target: 20, invert: true },
      { label: "Receivables Over 60d", actual: atRiskReceivables, target: kpiAlerts.maxAgingOver60, isMoney: true, invert: true },
      { label: "Membership Net Growth", actual: memberNetGrowth, target: 5, suffix: "" },
      { label: "P&L Categories In Range", actual: plData.okCount, target: COST_CATEGORIES.length - 2, suffix: "" },
      { label: "Active KPI Alerts", actual: activeAlerts.length, target: 0, invert: true, suffix: "" },
    ];
    return items.map(item => {
      let status;
      if (item.invert) {
        status = item.actual <= item.target ? "PASS" : item.actual <= item.target * 1.2 ? "WARN" : "FAIL";
      } else {
        status = item.actual >= item.target ? "PASS" : item.actual >= item.target * 0.85 ? "WARN" : "FAIL";
      }
      return { ...item, status };
    });
  }, [projectedMonthRevenue, revenue, plData, breakevenCalendarDay, atRiskReceivables, memberNetGrowth, activeAlerts]);

  const scorecardPass = scorecard.filter(s => s.status === "PASS").length;
  const scorecardFail = scorecard.filter(s => s.status === "FAIL").length;
  const scorecardGrade = scorecardFail === 0 && scorecardPass >= 6 ? "A" : scorecardFail === 0 ? "B" : scorecardFail <= 2 ? "C" : "D";

  // ═══ LAYER 3 — Strategic Intelligence Calculations ═══

  // Department costs (3-way split)
  const plumbingCosts = totalCosts * (deptSplit.plumbingPct / 100);
  const hvacCosts = totalCosts * (deptSplit.hvacPct / 100);
  const electricalCosts = totalCosts * (deptSplit.electricalPct / 100);

  // Department billable hours
  const plumbingHours = deptSplit.plumbingTechs * workDaysInMonth * settings.hoursPerDay * (settings.efficiencyRate / 100);
  const hvacHours = deptSplit.hvacTechs * workDaysInMonth * settings.hoursPerDay * (settings.efficiencyRate / 100);
  const electricalHours = deptSplit.electricalTechs * workDaysInMonth * settings.hoursPerDay * (settings.efficiencyRate / 100);

  // Department rates
  const plumbingBreakeven = plumbingHours > 0 ? plumbingCosts / plumbingHours : 0;
  const hvacBreakeven = hvacHours > 0 ? hvacCosts / hvacHours : 0;
  const electricalBreakeven = electricalHours > 0 ? electricalCosts / electricalHours : 0;
  const plumbingRate = plumbingBreakeven * (1 + settings.profitMargin / 100);
  const hvacRate = hvacBreakeven * (1 + settings.profitMargin / 100);
  const electricalRate = electricalBreakeven * (1 + settings.profitMargin / 100);
  const highestRate = Math.max(plumbingRate, hvacRate, electricalRate);
  const lowestRate = Math.min(plumbingRate, hvacRate, electricalRate);
  const rateDiff = highestRate - lowestRate;

  // Seasonal — current month multiplier and adjusted rate
  const currentMonthKey = "Apr";
  const currentSeasonalMult = seasonal[currentMonthKey] / 100;
  const seasonalAdjustedHours = billableHours * currentSeasonalMult;
  const seasonalAdjustedRate = seasonalAdjustedHours > 0
    ? (totalCosts / seasonalAdjustedHours) * (1 + settings.profitMargin / 100) : 0;

  // Seasonal annual view
  const MONTH_KEYS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const seasonalRates = MONTH_KEYS.map(m => {
    const mult = seasonal[m] / 100;
    const adjHours = billableHours * mult;
    return {
      month: m,
      mult: seasonal[m],
      hours: Math.round(adjHours),
      rate: adjHours > 0 ? Math.round((totalCosts / adjHours) * (1 + settings.profitMargin / 100)) : 0,
    };
  });
  const peakMonth = seasonalRates.reduce((a, b) => a.mult > b.mult ? a : b);
  const slowMonth = seasonalRates.reduce((a, b) => a.mult < b.mult ? a : b);

  // Customer Acquisition Cost
  const cac = acquisition.newCustomersPerMonth > 0
    ? costs.marketing / acquisition.newCustomersPerMonth : 0;
  const totalCustomersMonthly = acquisition.newCustomersPerMonth > 0 && (1 - acquisition.repeatCustomerPct / 100) !== 0
    ? Math.round(acquisition.newCustomersPerMonth / (1 - acquisition.repeatCustomerPct / 100)) : 0;
  const lifetimeJobsEstimate = 4.2; // avg jobs per customer over lifetime
  const ltv = lifetimeJobsEstimate * revenue.avgTicketTarget;
  const ltvToCac = cac > 0 ? ltv / cac : 0;
  const cacAnnual = cac * acquisition.newCustomersPerMonth * 12;

  // Layer 3 cost total
  const layer3Keys = ["cultureEvents", "trainingCerts"];
  const layer3Total = useMemo(() => layer3Keys.reduce((s, k) => s + costs[k], 0), [costs]);

  const chartMax = useMemo(() => {
    const all = [...HISTORICAL_RATES.map(h => h.rate), trueHourlyRate];
    return Math.ceil(Math.max(...all) / 50) * 50 + 50;
  }, [trueHourlyRate]);
  const chartMin = useMemo(() => {
    const all = [...HISTORICAL_RATES.map(h => h.rate), trueHourlyRate];
    return Math.floor(Math.min(...all) / 50) * 50 - 25;
  }, [trueHourlyRate]);

  const updateCost = (key, val) => setCosts(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  const updateSetting = (key, val) => setSettings(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));

  const handleApprove = () => {
    if (bigSwing && !showConfirm) { setShowConfirm(true); return; }
    setApproved(true); setShowConfirm(false);
  };

  const fmt = (n) => "$" + Math.round(n).toLocaleString();
  const fmtD = (n) => "$" + n.toLocaleString();

  // ═══ AI AGENT STATE ═══
  const [agentAnalysis, setAgentAnalysis] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentHistory, setAgentHistory] = useState([]);

  const runAgent = async (prompt) => {
    setAgentLoading(true);
    setAgentAnalysis("");
    const snapshot = {
      trueHourlyRate: Math.round(trueHourlyRate),
      breakeven: Math.round(breakeven),
      totalCosts, profitMargin: settings.profitMargin,
      billableHours: Math.round(billableHours),
      numTechs: settings.numTechs, efficiency: settings.efficiencyRate,
      projectedRevenue: Math.round(projectedMonthRevenue),
      projectedProfit: Math.round(projectedMonthProfit),
      projectedMargin: projectedMargin.toFixed(1),
      breakevenDay: breakevenCalendarDay,
      boardRevDaily: Math.round(boardRevTotalDaily),
      revenueTarget: revenue.monthlyTarget,
      boardCalls: boardTotalDaily,
      closeRate: revenue.closeRate,
      receivablesTotal: totalReceivables,
      receivablesAtRisk: atRiskReceivables,
      memberCount: membership.totalMembers,
      memberChurn: memberChurnRate.toFixed(1),
      memberNetGrowth,
      scorecardGrade,
      activeAlerts: activeAlerts.length,
      alertDetails: activeAlerts.map(a => a.label).join(", ") || "none",
      plNetProfit: plData.netProfitPct.toFixed(1),
      plOverCount: plData.overCount,
      plUnderCount: plData.underCount,
      costs: Object.entries(costs).map(([k, v]) => `${k}: $${v.toLocaleString()}`).join(", "),
      departments: `Plumbing: ${fmt(plumbingRate)}/hr (${deptSplit.plumbingPct}% costs, ${deptSplit.plumbingTechs} techs), HVAC: ${fmt(hvacRate)}/hr (${deptSplit.hvacPct}% costs, ${deptSplit.hvacTechs} techs), Electrical: ${fmt(electricalRate)}/hr (${deptSplit.electricalPct}% costs, ${deptSplit.electricalTechs} techs)`,
      boardBreakdown: `PLB Svc: ${board.plumbingService}, PLB Inst: ${board.plumbingInstall}, HVAC Svc: ${board.hvacService}, HVAC Inst: ${board.hvacInstall}, Elec Svc: ${board.electricalService}, Elec Inst: ${board.electricalInstall}`,
    };

    const systemPrompt = `You are the CoDB Rate Engine AI Agent for JT Plumbing Heating & Air, powered by TradeSavant.ai. You are a brutally honest financial analyst for trades businesses. You analyze cost-of-doing-business data, dispatch board performance, P&L benchmarks, cash flow, and membership health. You speak directly — no fluff, no sugarcoating. You tell the owner what they NEED to know, not what they want to hear. Format your response with clear sections using ** for bold headers. Keep it actionable.`;

    const userPrompt = `${prompt}

CURRENT BUSINESS SNAPSHOT:
- True Hourly Rate: $${snapshot.trueHourlyRate}/hr (Breakeven: $${snapshot.breakeven}/hr)
- Total Monthly Costs: $${snapshot.totalCosts.toLocaleString()} | Profit Margin Target: ${snapshot.profitMargin}%
- Billable Hours: ${snapshot.billableHours} (${snapshot.numTechs} techs × ${snapshot.efficiency}% efficiency)
- Projected Monthly Revenue: $${snapshot.projectedRevenue.toLocaleString()} vs Target: $${snapshot.revenueTarget.toLocaleString()}
- Projected Profit: $${snapshot.projectedProfit.toLocaleString()} (${snapshot.projectedMargin}% margin)
- Breakeven Day: Day ${snapshot.breakevenDay} of the month
- Today's Board: ${snapshot.boardCalls} calls → $${snapshot.boardRevDaily.toLocaleString()}/day projected
- Board Breakdown: ${snapshot.boardBreakdown}
- Close Rate: ${snapshot.closeRate}%
- Department Rates: ${snapshot.departments}
- Receivables: $${snapshot.receivablesTotal.toLocaleString()} total, $${snapshot.receivablesAtRisk.toLocaleString()} at risk (60d+)
- Membership: ${snapshot.memberCount} members, ${snapshot.memberChurn}% monthly churn, net growth: ${snapshot.memberNetGrowth}
- Monthly Scorecard: Grade ${snapshot.scorecardGrade}
- Active KPI Alerts: ${snapshot.activeAlerts} (${snapshot.alertDetails})
- P&L: ${snapshot.plNetProfit}% net profit, ${snapshot.plOverCount} categories over benchmark, ${snapshot.plUnderCount} under
- Cost Breakdown: ${snapshot.costs}`;

    try {
      const response = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("\n") || "Agent failed to respond.";
      setAgentAnalysis(text);
      setAgentHistory(prev => [{ prompt, response: text, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } catch (err) {
      setAgentAnalysis("Error connecting to agent: " + err.message);
    }
    setAgentLoading(false);
  };

  const tabs = [
    { key: "command", label: "COMMAND CENTER" },
    { key: "agent", label: "AI AGENT" },
    { key: "costs", label: "COST ENGINE" },
    { key: "pricebook", label: "PRICEBOOK IMPACT" },
    { key: "history", label: "RATE HISTORY" },
    { key: "approve", label: "DEPLOY" },
  ];

  return (
    <div style={{ background: C.black, color: C.white, minHeight: "100vh", fontFamily: "'Bebas Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;800;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.black}; }
        ::-webkit-scrollbar-thumb { background: ${C.red}; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes redPulse { 0%, 100% { box-shadow: 0 0 15px rgba(220,38,38,0.15); } 50% { box-shadow: 0 0 30px rgba(220,38,38,0.35); } }
        @keyframes countUp { from { opacity: 0; } to { opacity: 1; } }
        @keyframes statusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .jtab:hover { background: rgba(255,255,255,0.04) !important; }
        .jcard:hover { border-color: rgba(220,38,38,0.2) !important; }
        .jbtn:hover { filter: brightness(1.1); }
        .jrow:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{ background: C.blackLight, borderBottom: `1px solid ${C.white08}` }}>
        {/* Top bar — logos + status */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 32px", flexWrap: "wrap", gap: 16,
        }}>
          {/* Left — JT Logo + Company Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src="data:image/png;base64,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" alt="JT Plumbing Heating & Air" style={ { width: 52, height: 44, objectFit: "contain" } } />
            <div>
              <h1 style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: C.white,
                letterSpacing: "0.06em", lineHeight: 1, margin: 0,
              }}>JT PLUMBING HEATING & AIR</h1>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 600, color: C.white30, letterSpacing: "0.2em", marginTop: 3 }}>
                CoDB RATE ENGINE
              </div>
            </div>
          </div>

          {/* Center — Status + Month */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
              border: `1px solid ${approved ? "rgba(34,197,94,0.25)" : "rgba(220,38,38,0.25)"}`,
              borderRadius: 4, background: approved ? "rgba(34,197,94,0.06)" : "rgba(220,38,38,0.04)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: approved ? C.green : C.red,
                animation: approved ? "none" : "statusPulse 2s infinite",
              }} />
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                letterSpacing: "0.1em", color: approved ? C.green : C.redBright,
              }}>{approved ? "DEPLOYED" : "PENDING"}</span>
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white30,
              padding: "6px 12px", background: C.white02, borderRadius: 4, border: `1px solid ${C.white04}`,
            }}>{currentMonth.toUpperCase()}</span>
          </div>

          {/* Right — TradeSavant Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, fontWeight: 500, color: C.white15, letterSpacing: "0.15em", textAlign: "right" }}>POWERED BY</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: C.white50, letterSpacing: "0.08em", lineHeight: 1 }}>
                TRADE<span style={{ color: C.red }}>SAVANT</span><span style={{ color: C.white30, fontSize: 14 }}>.AI</span>
              </div>
            </div>
            <img src="data:image/png;base64,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" alt="TradeSavant" style={{ width: 40, height: 40, borderRadius: 6 }} />
          </div>
        </div>

        {/* Red accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${C.red}, transparent 60%)` }} />

        {/* ═══ TABS ═══ */}
        <div style={{ display: "flex", gap: 0, padding: "0 32px", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.key} className="jtab" onClick={() => setActiveTab(t.key)} style={{
              padding: "12px 22px", border: "none",
              borderBottom: activeTab === t.key ? `2px solid ${C.red}` : "2px solid transparent",
              background: "transparent",
              color: activeTab === t.key ? C.white : C.white30,
              cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.16em",
              transition: "all 0.2s", whiteSpace: "nowrap", position: "relative",
            }}>
              {t.label}
              {t.key === "approve" && !approved && (
                <span style={{
                  position: "absolute", top: 7, right: 6, width: 6, height: 6,
                  borderRadius: "50%", background: C.red,
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ══════ COMMAND CENTER ══════ */}
        {activeTab === "command" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {/* Primary KPI */}
            <div style={{
              background: C.blackCard,
              border: `1px solid rgba(220,38,38,0.15)`, borderRadius: 8,
              padding: "28px 28px", marginBottom: 20,
              borderLeft: `3px solid ${C.red}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                <div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                    letterSpacing: "0.2em", color: C.red, marginBottom: 6,
                  }}>TRUE HOURLY RATE</div>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 77, color: C.white,
                    lineHeight: 1, letterSpacing: "0.02em",
                  }}>{fmt(trueHourlyRate)}</div>
                  <div style={{
                    fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600,
                    color: rateDelta > 0 ? C.redBright : C.green, marginTop: 6,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 18, height: 18, borderRadius: 3,
                      background: rateDelta > 0 ? "rgba(239,68,68,0.12)" : C.greenSub,
                      fontSize:12,
                    }}>{rateDelta > 0 ? "▲" : "▼"}</span>
                    {Math.abs(rateDelta).toFixed(1)}% from prior month
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px" }}>
                  {[
                    { label: "BREAKEVEN", value: fmt(breakeven) },
                    { label: "PROFIT TARGET", value: settings.profitMargin + "%" },
                    { label: "MONTHLY COSTS", value: fmtD(totalCosts) },
                    { label: "BILLABLE HOURS", value: Math.round(billableHours).toString() },
                  ].map(k => (
                    <div key={k.label}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 600, letterSpacing: "0.15em", color: C.white30 }}>{k.label}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: C.white90 }}>{k.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "VS LAST MONTH", delta: rateDelta, ref: fmt(prevRate) },
                { label: "VS 3-MO AVG", delta: ((trueHourlyRate - avg3) / avg3 * 100), ref: fmt(avg3) },
                { label: "VS 6-MO AVG", delta: ((trueHourlyRate - avg6) / avg6 * 100), ref: fmt(avg6) },
                { label: "TECHS × EFF.", delta: null, ref: `${settings.numTechs} × ${settings.efficiencyRate}%` },
              ].map((c, i) => (
                <div key={i} className="jcard" style={{
                  background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 6,
                  padding: "18px 16px", textAlign: "center", transition: "all 0.2s",
                  animation: "fadeUp 0.4s ease", animationDelay: `${i * 0.08}s`,
                  animationFillMode: "both",
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 600, letterSpacing: "0.15em", color: C.white30 }}>{c.label}</div>
                  {c.delta !== null ? (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 29, fontWeight: 700, color: c.delta > 0 ? C.redBright : C.green, margin: "4px 0" }}>
                      {c.delta > 0 ? "+" : ""}{c.delta.toFixed(1)}%
                    </div>
                  ) : (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 29, fontWeight: 700, color: C.white, margin: "4px 0" }}>{c.ref}</div>
                  )}
                  {c.delta !== null && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white30 }}>{c.ref}</div>}
                </div>
              ))}
            </div>

            {/* ═══ LAYER 1 — HIDDEN COST RECOVERY ═══ */}
            <div style={{
              background: `linear-gradient(135deg, rgba(220,38,38,0.06), ${C.blackCard})`,
              border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 8,
              padding: 24, marginBottom: 28, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                background: C.red,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.black, letterSpacing: "0.1em",
                  background: C.red, padding: "3px 10px", borderRadius: 3,
                }}>LAYER 1</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>
                  HIDDEN COST RECOVERY
                </h2>
              </div>
              <p style={{
                fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white50, marginBottom: 20, lineHeight: 1.5,
              }}>
                These 4 costs were missing from your rate. Without them, you were undercharging on every single job.
              </p>

              {/* Before / After Rate */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, marginBottom: 20,
                background: C.white02, borderRadius: 6, overflow: "hidden",
              }}>
                <div style={{ padding: "20px 24px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30 }}>WITHOUT LAYER 1</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 38, fontWeight: 700, color: C.white30, textDecoration: "line-through", textDecorationColor: C.red, margin: "4px 0" }}>{fmt(rateWithoutLayer1)}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15 }}>Your old rate — underpriced</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: C.red }}>→</span>
                </div>
                <div style={{ padding: "20px 24px", textAlign: "center", background: C.redSubtle }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.red }}>WITH LAYER 1</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 38, fontWeight: 700, color: C.white, margin: "4px 0" }}>{fmt(trueHourlyRate)}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white50 }}>Your real rate — accurate</div>
                </div>
              </div>

              {/* Layer 1 Impact Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "RATE IMPACT", value: `+${fmt(layer1RateImpact)}`, sub: "per hour recovered" },
                  { label: "PER JOB IMPACT", value: `+${fmt(layer1PerJobImpact)}`, sub: `avg ${avgJobHours.toFixed(1)}hr job` },
                  { label: "MONTHLY HIDDEN", value: fmtD(layer1Total), sub: `${layer1PctOfCosts.toFixed(0)}% of total costs` },
                  { label: "ANNUAL RECOVERY", value: fmtD(layer1AnnualRecovery), sub: "money you were leaving" },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: C.white02, borderRadius: 4, padding: "14px 12px", textAlign: "center",
                    border: `1px solid ${C.white04}`,
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30 }}>{s.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: C.red, margin: "4px 0" }}>{s.value}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Layer 1 Line Items */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Owner's Compensation", value: costs.ownerComp, note: "If you're not a line item, your rate is a lie" },
                  { label: "Warranty / Callback Reserve", value: costs.warrantyReserve, note: "Every callback = unbilled labor you're already paying" },
                  { label: "Tax Reserve", value: costs.taxReserve, note: "Quarterly estimates are a monthly cost, not a surprise" },
                  { label: "Debt Service", value: costs.debtService, note: "Equipment loans, vehicle payments, credit lines" },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: C.white02, borderRadius: 4, padding: "12px 14px",
                    borderLeft: `2px solid ${C.red}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: C.white70 }}>{item.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: C.white }}>{fmtD(item.value)}</span>
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15, marginTop: 4, fontStyle: "italic" }}>{item.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ LAYER 2 — REVENUE REALITY CHECK ═══ */}
            <div style={{
              background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8,
              padding: 24, marginBottom: 28, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                background: C.white,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.black, letterSpacing: "0.1em",
                  background: C.white, padding: "3px 10px", borderRadius: 3,
                }}>LAYER 2</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>
                  REVENUE REALITY CHECK
                </h2>
              </div>
              <p style={{
                fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white50, marginBottom: 20, lineHeight: 1.5,
              }}>
                Your rate means nothing if the math doesn't work in the field. Here's whether your targets are actually hittable.
              </p>

              {/* Revenue vs Costs Bar */}
              <div style={{
                background: C.white02, borderRadius: 6, padding: "20px 24px", marginBottom: 20,
                border: `1px solid ${C.white04}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30 }}>MONTHLY REVENUE TARGET</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: C.white, lineHeight: 1 }}>{fmtD(revenue.monthlyTarget)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: netAfterCosts > 0 ? C.green : C.redBright }}>NET AFTER ALL COSTS</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: netAfterCosts > 0 ? C.green : C.redBright, lineHeight: 1 }}>{fmtD(netAfterCosts)}</div>
                  </div>
                </div>
                {/* Visual bar showing costs vs profit */}
                <div style={{ height: 12, borderRadius: 6, overflow: "hidden", display: "flex", background: C.white04 }}>
                  <div style={{
                    width: `${Math.min(revenue.monthlyTarget > 0 ? totalCosts / revenue.monthlyTarget * 100 : 0, 100)}%`,
                    background: `linear-gradient(90deg, ${C.red}, ${C.redBright})`,
                    transition: "width 0.6s ease",
                  }} />
                  {netAfterCosts > 0 && <div style={{
                    width: `${(netAfterCosts / revenue.monthlyTarget * 100)}%`,
                    background: `linear-gradient(90deg, ${C.green}, #4ade80)`,
                    transition: "width 0.6s ease",
                  }} />}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.red }}>
                    Costs: {fmtD(totalCosts)} ({revenue.monthlyTarget > 0 ? (totalCosts / revenue.monthlyTarget * 100).toFixed(0) : '0'}%)
                  </span>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: netAfterCosts > 0 ? C.green : C.redBright }}>
                    {netAfterCosts > 0 ? "Profit" : "Loss"}: {netMarginActual.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "REV / TECH", value: fmtD(Math.round(revenuePerTech)), sub: "per month" },
                  { label: "REV / TRUCK", value: fmtD(Math.round(revenuePerTruck)), sub: `${revenue.numTrucks} trucks` },
                  { label: "AVG TICKET TARGET", value: fmtD(revenue.avgTicketTarget), sub: "per invoice" },
                  { label: "ANNUAL TARGET", value: fmtD(annualRevTarget), sub: `${fmtD(annualNetProfit)} net` },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: C.white02, borderRadius: 4, padding: "14px 12px", textAlign: "center",
                    border: `1px solid ${C.white04}`,
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30 }}>{s.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.white, margin: "4px 0" }}>{s.value}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Jobs Required + Capacity */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {/* Jobs Math */}
                <div style={{
                  background: C.white02, borderRadius: 6, padding: "18px 20px",
                  border: `1px solid ${C.white04}`,
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30, marginBottom: 12 }}>JOBS REQUIRED</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white50 }}>Total jobs needed / month</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: C.white }}>{requiredJobs}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white50 }}>Jobs / tech / day</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: jobsPerTechPerDay > 4 ? C.redBright : jobsPerTechPerDay > 3 ? C.amber : C.green }}>
                        {jobsPerTechPerDay.toFixed(1)}
                      </span>
                    </div>
                    <div style={{ height: 1, background: C.white04 }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.green }}>Membership covers</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: C.green }}>
                        -{jobsSavedByMembership} jobs
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white70, fontWeight: 600 }}>Remaining to sell</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: C.white }}>{requiredJobsAfterMembership}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity Check */}
                <div style={{
                  background: C.white02, borderRadius: 6, padding: "18px 20px",
                  border: `1px solid ${capacityStatus === "OVER" ? "rgba(239,68,68,0.3)" : capacityStatus === "TIGHT" ? "rgba(245,158,11,0.3)" : C.white04}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30 }}>CAPACITY CHECK</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize:12, fontWeight: 700,
                      padding: "2px 6px", borderRadius: 2,
                      background: capacityStatus === "OVER" ? "rgba(239,68,68,0.15)" : capacityStatus === "TIGHT" ? C.amberSub : C.greenSub,
                      color: capacityStatus === "OVER" ? C.redBright : capacityStatus === "TIGHT" ? C.amber : C.green,
                    }}>{capacityStatus}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white50 }}>Max revenue capacity</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: C.white }}>{fmtD(Math.round(maxRevenueCapacity))}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white50 }}>Capacity used</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: capacityStatus === "OVER" ? C.redBright : capacityStatus === "TIGHT" ? C.amber : C.green }}>
                        {capacityUtilization.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: C.white04, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${Math.min(capacityUtilization, 100)}%`,
                        background: capacityStatus === "OVER" ? C.redBright : capacityStatus === "TIGHT"
                          ? `linear-gradient(90deg, ${C.amber}, #fbbf24)` : `linear-gradient(90deg, ${C.green}, #4ade80)`,
                        borderRadius: 3, transition: "width 0.6s ease",
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white50 }}>
                        {revenueGapOrSurplus >= 0 ? "Headroom" : "Shortfall"}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: revenueGapOrSurplus >= 0 ? C.green : C.redBright }}>
                        {revenueGapOrSurplus >= 0 ? "+" : ""}{fmtD(Math.round(revenueGapOrSurplus))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Membership Impact */}
              <div style={{
                background: C.white02, borderRadius: 6, padding: "16px 20px",
                border: `1px solid ${C.white04}`, display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: C.green }}>♻</span>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: C.green, letterSpacing: "0.06em" }}>MEMBERSHIP REVENUE</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>Recurring revenue that reduces pressure on one-time sales</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.green }}>{fmtD(revenue.membershipRevenue)}/mo</div>
                  </div>
                  <div style={{ width: 1, height: 30, background: C.white08 }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.green }}>{membershipPctOfRevenue.toFixed(1)}%</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>of target</div>
                  </div>
                  <div style={{ width: 1, height: 30, background: C.white08 }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.green }}>{fmtD(revenue.membershipRevenue * 12)}/yr</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>annualized</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ DISPATCH BOARD ═══ */}
            <div style={{
              background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8,
              padding: 24, marginBottom: 28, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                background: `linear-gradient(180deg, ${C.red}, ${C.white})`,
              }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.white, letterSpacing: "0.1em",
                    background: C.red, padding: "3px 10px", borderRadius: 3,
                  }}>LIVE</span>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>
                    DISPATCH BOARD
                  </h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize:12, fontWeight: 700,
                    padding: "4px 10px", borderRadius: 3,
                    background: boardPaceStatus === "ON PACE" ? C.greenSub : boardPaceStatus === "CLOSE" ? C.amberSub : "rgba(239,68,68,0.12)",
                    color: boardPaceStatus === "ON PACE" ? C.green : boardPaceStatus === "CLOSE" ? C.amber : C.redBright,
                    letterSpacing: "0.08em",
                  }}>{boardPaceStatus}</span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white30,
                    padding: "4px 10px", background: C.white02, borderRadius: 3, border: `1px solid ${C.white04}`,
                  }}>{revenue.closeRate}% CLOSE · PLB {fmtD(revenue.plumbingServiceTicket)}/{fmtD(revenue.plumbingInstallTicket)} · HVAC {fmtD(revenue.hvacServiceTicket)}/{fmtD(revenue.hvacInstallTicket)} · ELEC {fmtD(revenue.electricalServiceTicket)}/{fmtD(revenue.electricalInstallTicket)}</span>
                </div>
              </div>

              {/* ── TODAY'S BOARD — Editable Inputs ── */}
              <div style={{
                background: `linear-gradient(135deg, rgba(220,38,38,0.08), ${C.white02})`,
                border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 6,
                padding: "24px", marginBottom: 16,
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.2em", color: C.red, marginBottom: 18 }}>
                  TODAY'S BOARD — ENTER YOUR CALLS BY DEPARTMENT
                </div>

                {/* 6-Way Input Grid — PLB / HVAC / ELEC × Service / Install */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { key: "plumbingService", label: "PLB SERVICE", color: C.red, bg: "rgba(220,38,38,0.04)", border: "rgba(220,38,38,0.12)", ticket: revenue.plumbingServiceTicket, rev: boardRevPlumbSvc },
                    { key: "plumbingInstall", label: "PLB INSTALL", color: C.red, bg: "rgba(220,38,38,0.04)", border: "rgba(220,38,38,0.12)", ticket: revenue.plumbingInstallTicket, rev: boardRevPlumbInst },
                    { key: "hvacService", label: "HVAC SERVICE", color: C.blue, bg: "rgba(59,130,246,0.04)", border: "rgba(59,130,246,0.12)", ticket: revenue.hvacServiceTicket, rev: boardRevHvacSvc },
                    { key: "hvacInstall", label: "HVAC INSTALL", color: C.blue, bg: "rgba(59,130,246,0.04)", border: "rgba(59,130,246,0.12)", ticket: revenue.hvacInstallTicket, rev: boardRevHvacInst },
                    { key: "electricalService", label: "ELEC SERVICE", color: C.amber, bg: "rgba(245,158,11,0.04)", border: "rgba(245,158,11,0.12)", ticket: revenue.electricalServiceTicket, rev: boardRevElecSvc },
                    { key: "electricalInstall", label: "ELEC INSTALL", color: C.amber, bg: "rgba(245,158,11,0.04)", border: "rgba(245,158,11,0.12)", ticket: revenue.electricalInstallTicket, rev: boardRevElecInst },
                  ].map(item => (
                    <div key={item.key} style={{ background: item.bg, borderRadius: 6, padding: "14px", border: `1px solid ${item.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, color: item.color, letterSpacing: "0.1em" }}>{item.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <input type="number" value={board[item.key]}
                          onChange={e => updateBoard(item.key, e.target.value)}
                          style={{
                            width: 60, border: "none", borderBottom: `2px solid ${item.color}`,
                            background: "transparent", color: C.white, fontSize: 36,
                            fontFamily: "'Bebas Neue', sans-serif", textAlign: "center", outline: "none",
                          }} />
                        <div>
                          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>@ {fmtD(item.ticket)} avg</div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: C.white50 }}>→ {fmtD(Math.round(item.rev))}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Department Totals — 3 depts + grand total */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                  {[
                    { label: "PLUMBING", color: C.red, bg: "rgba(220,38,38,0.05)", border: "rgba(220,38,38,0.1)", calls: boardPlumbingDaily, svc: board.plumbingService, inst: board.plumbingInstall, svcRev: boardRevPlumbSvc, instRev: boardRevPlumbInst, total: boardRevPlumbingDaily },
                    { label: "HVAC", color: C.blue, bg: "rgba(59,130,246,0.05)", border: "rgba(59,130,246,0.1)", calls: boardHvacDaily, svc: board.hvacService, inst: board.hvacInstall, svcRev: boardRevHvacSvc, instRev: boardRevHvacInst, total: boardRevHvacDaily },
                    { label: "ELECTRICAL", color: C.amber, bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.1)", calls: boardElectricalDaily, svc: board.electricalService, inst: board.electricalInstall, svcRev: boardRevElecSvc, instRev: boardRevElecInst, total: boardRevElectricalDaily },
                  ].map(d => (
                    <div key={d.label} style={{ background: d.bg, borderRadius: 6, padding: "12px", border: `1px solid ${d.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: d.color }}>{d.label}</span>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: C.white }}>{d.calls}</span>
                      </div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginBottom: 4 }}>Svc {d.svc} · Inst {d.inst}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: d.color }}>{fmtD(Math.round(d.total))}</div>
                    </div>
                  ))}
                  <div style={{
                    background: boardPaceStatus === "ON PACE" ? "rgba(34,197,94,0.05)" : boardPaceStatus === "CLOSE" ? "rgba(245,158,11,0.05)" : "rgba(239,68,68,0.05)",
                    borderRadius: 6, padding: "12px",
                    border: `1px solid ${boardPaceStatus === "ON PACE" ? "rgba(34,197,94,0.12)" : boardPaceStatus === "CLOSE" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)"}`,
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.white30, marginBottom: 6 }}>TOTAL</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: C.white, marginBottom: 4 }}>{boardTotalDaily} calls</div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700,
                      color: boardPaceStatus === "ON PACE" ? C.green : boardPaceStatus === "CLOSE" ? C.amber : C.redBright,
                    }}>{fmtD(Math.round(boardRevTotalDaily))}</div>
                  </div>
                </div>

                {/* Service vs Install Totals */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  <div style={{ background: C.white02, borderRadius: 6, padding: "12px", textAlign: "center", border: `1px solid ${C.white04}` }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.white50 }}>ALL SERVICE</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: C.white, lineHeight: 1, margin: "4px 0" }}>{boardServiceDaily} calls</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: C.white70 }}>{fmtD(Math.round(boardRevServiceDaily))}</div>
                  </div>
                  <div style={{ background: C.white02, borderRadius: 6, padding: "12px", textAlign: "center", border: `1px solid ${C.white04}` }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.white50 }}>ALL INSTALLS</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: C.white, lineHeight: 1, margin: "4px 0" }}>{boardInstallDaily} calls</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: C.white70 }}>{fmtD(Math.round(boardRevInstallDaily))}</div>
                  </div>
                </div>

                {/* Per Tech Today */}
                <div style={{
                  display: "flex", justifyContent: "space-around", padding: "12px 0",
                  borderTop: `1px solid ${C.white04}`, flexWrap: "wrap", gap: 12,
                }}>
                  {[
                    { label: "CALLS / TECH", value: settings.numTechs > 0 ? (boardTotalDaily / settings.numTechs).toFixed(1) : '0.0' },
                    { label: "SOLD / TECH", value: settings.numTechs > 0 ? (boardSoldTotalDaily / settings.numTechs).toFixed(1) : '0.0' },
                    { label: "REV / TECH", value: settings.numTechs > 0 ? fmtD(Math.round(boardRevTotalDaily / settings.numTechs)) : fmtD(0) },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white15 }}>{s.label}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: C.white }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── PROJECTIONS TABLE — Day / Week / Month ── */}
              <div style={{
                background: C.white02, border: `1px solid ${C.white04}`, borderRadius: 6,
                padding: "20px 24px", marginBottom: 16,
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.2em", color: C.white30, marginBottom: 14 }}>
                  BOARD PROJECTION vs TARGET — EDIT DAILY TARGETS
                </div>

                {/* Header */}
                <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr 1fr 1fr 1fr 1fr", gap: 0, marginBottom: 2 }}>
                  <div />
                  <div style={{ gridColumn: "span 3", textAlign: "center", padding: "6px 0", borderBottom: `2px solid ${C.red}` }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.red }}>PROJECTED (FROM BOARD)</span>
                  </div>
                  <div style={{ gridColumn: "span 3", textAlign: "center", padding: "6px 0", borderBottom: `2px solid ${C.white15}` }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30 }}>TARGET (EDITABLE)</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr 1fr 1fr 1fr 1fr", gap: 0 }}>
                  <div />
                  {["DAY", "WEEK", "MONTH", "DAY", "WEEK", "MONTH"].map((h, i) => (
                    <div key={`${h}${i}`} style={{
                      textAlign: "center", padding: "6px 0",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                      letterSpacing: "0.12em", color: i < 3 ? C.white50 : C.white15,
                      borderBottom: `1px solid ${C.white04}`,
                    }}>{h}</div>
                  ))}
                </div>

                {/* Data Rows */}
                {[
                  {
                    label: "TOTAL CALLS", color: C.white,
                    proj: [boardTotalDaily, boardTotalWeekly, boardTotalMonthly],
                    targetKey: null,
                    targetVals: [targets.serviceCalls + targets.installCalls, (targets.serviceCalls + targets.installCalls) * 5, (targets.serviceCalls + targets.installCalls) * workDaysInMonth],
                  },
                  {
                    label: "SERVICE", color: C.red,
                    proj: [boardServiceDaily, boardServiceDaily * 5, boardServiceDaily * workDaysInMonth],
                    targetKey: "serviceCalls",
                    targetVals: [targets.serviceCalls, targets.serviceCalls * 5, targets.serviceCalls * workDaysInMonth],
                  },
                  {
                    label: "INSTALLS", color: C.white70,
                    proj: [boardInstallDaily, boardInstallDaily * 5, boardInstallDaily * workDaysInMonth],
                    targetKey: "installCalls",
                    targetVals: [targets.installCalls, targets.installCalls * 5, targets.installCalls * workDaysInMonth],
                  },
                  {
                    label: "SOLD JOBS", color: C.green,
                    proj: [Math.round(boardSoldTotalDaily), Math.round(boardSoldTotalDaily * 5), Math.round(boardSoldTotalDaily * workDaysInMonth)],
                    targetKey: "soldJobs",
                    targetVals: [targets.soldJobs, targets.soldJobs * 5, targets.soldJobs * workDaysInMonth],
                  },
                  {
                    label: "REVENUE", color: C.green, isMoney: true,
                    proj: [boardRevTotalDaily, boardRevTotalWeekly, boardRevTotalMonthly],
                    targetKey: "dailyRevenue",
                    targetVals: [targets.dailyRevenue, targets.dailyRevenue * 5, targets.dailyRevenue * workDaysInMonth],
                  },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "130px 1fr 1fr 1fr 1fr 1fr 1fr", gap: 0,
                    borderBottom: `1px solid ${C.white04}`,
                    background: i % 2 === 0 ? "transparent" : C.white02,
                  }}>
                    <div style={{ padding: "10px 0", display: "flex", alignItems: "center" }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.06em", color: row.color }}>{row.label}</span>
                    </div>
                    {row.proj.map((val, j) => {
                      const tgt = row.targetVals[j];
                      const ahead = row.isMoney ? val >= tgt : val >= tgt;
                      return (
                        <div key={`p${j}`} style={{
                          textAlign: "center", padding: "10px 4px",
                          borderLeft: `1px solid ${C.white04}`,
                          background: j === 0 ? "rgba(220,38,38,0.03)" : "transparent",
                        }}>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: row.isMoney ? 12 : 16, fontWeight: 700,
                            color: ahead ? C.green : C.redBright,
                          }}>{row.isMoney ? fmtD(Math.round(val)) : Math.round(val)}</span>
                        </div>
                      );
                    })}
                    {row.targetVals.map((val, j) => (
                      <div key={`t${j}`} style={{
                        textAlign: "center", padding: j === 0 && row.targetKey ? "4px 4px" : "10px 4px",
                        borderLeft: j === 0 ? `2px solid ${C.white08}` : `1px solid ${C.white04}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {j === 0 && row.targetKey ? (
                          <input type="number" value={targets[row.targetKey]}
                            onChange={e => updateTarget(row.targetKey, e.target.value)}
                            style={{
                              width: row.isMoney ? 64 : 44, border: "none", borderBottom: `1px solid ${C.white08}`,
                              background: "transparent", color: C.white, fontSize: row.isMoney ? 11 : 15,
                              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                              textAlign: "center", outline: "none",
                            }} />
                        ) : (
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: row.isMoney ? 11 : 15, fontWeight: 600,
                            color: C.white30,
                          }}>{row.isMoney ? fmtD(Math.round(val)) : Math.round(val)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* ── PACE INDICATOR ── */}
              <div style={{
                background: boardPaceStatus === "ON PACE" ? "rgba(34,197,94,0.06)" : boardPaceStatus === "CLOSE" ? "rgba(245,158,11,0.06)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${boardPaceStatus === "ON PACE" ? "rgba(34,197,94,0.15)" : boardPaceStatus === "CLOSE" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"}`,
                borderRadius: 6, padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{boardPaceStatus === "ON PACE" ? "✅" : boardPaceStatus === "CLOSE" ? "⚠️" : "🔴"}</span>
                  <div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                      color: boardPaceStatus === "ON PACE" ? C.green : boardPaceStatus === "CLOSE" ? C.amber : C.redBright,
                    }}>
                      {boardPaceStatus === "ON PACE" ? "On pace to hit target" : boardPaceStatus === "CLOSE" ? "Close — need more calls" : "Behind pace — board is light"}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white30 }}>
                      At this daily board, you'll project {fmtD(Math.round(boardRevTotalMonthly))}/mo vs {fmtD(revenue.monthlyTarget)} target
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700,
                    color: boardVsTarget >= 0 ? C.green : C.redBright,
                  }}>{boardVsTarget >= 0 ? "+" : ""}{fmtD(Math.round(boardVsTarget))}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>
                    {boardVsTargetPct >= 0 ? "+" : ""}{boardVsTargetPct.toFixed(1)}% vs monthly target
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ BREAKEVEN DAY & AT-THIS-PACE ═══ */}
            <div style={{
              background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8,
              padding: 24, marginBottom: 28, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                background: `linear-gradient(180deg, ${C.redBright}, ${C.green})`,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.white, letterSpacing: "0.1em",
                  background: C.red, padding: "3px 10px", borderRadius: 3,
                }}>FORECAST</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>
                  BREAKEVEN DAY & PROJECTIONS
                </h2>
              </div>

              {/* Breakeven Visual — Calendar Bar */}
              <div style={{
                background: C.white02, border: `1px solid ${C.white04}`, borderRadius: 6,
                padding: "24px", marginBottom: 16,
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.2em", color: C.white30, marginBottom: 16 }}>
                  WHEN DO YOU START MAKING MONEY?
                </div>

                {/* Calendar bar */}
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <div style={{ display: "flex", height: 48, borderRadius: 6, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min(isFinite(breakevenPct) ? breakevenPct : 0, 100)}%`,
                      background: `linear-gradient(90deg, ${C.redDark}, ${C.red})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "width 0.6s ease", minWidth: 60,
                    }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, color: C.white, letterSpacing: "0.08em" }}>
                        COVERING COSTS
                      </span>
                    </div>
                    {profitDays > 0 && <div style={{
                      flex: 1,
                      background: `linear-gradient(90deg, ${C.green}, #4ade80)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "width 0.6s ease",
                    }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, color: C.black, letterSpacing: "0.08em" }}>
                        PROFIT ZONE
                      </span>
                    </div>}
                  </div>
                  {/* Breakeven marker */}
                  <div style={{
                    position: "absolute", top: -8, left: `${Math.min(isFinite(breakevenPct) ? breakevenPct : 0, 98)}%`,
                    transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center",
                  }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: C.amber,
                      background: C.blackCard, padding: "2px 8px", borderRadius: 3,
                      border: `1px solid ${C.amber}`, whiteSpace: "nowrap",
                    }}>DAY {breakevenCalendarDay}</div>
                  </div>
                </div>

                {/* Breakeven Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30 }}>BREAKEVEN DAY</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: breakevenCalendarDay > 22 ? C.redBright : breakevenCalendarDay > 18 ? C.amber : C.green, lineHeight: 1 }}>
                      {breakevenCalendarDay}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>of the month</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30 }}>PROFIT DAYS</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: profitDays > 5 ? C.green : profitDays > 0 ? C.amber : C.redBright, lineHeight: 1 }}>
                      {Math.max(profitDays, 0)}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>work days left</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30 }}>PROJECTED PROFIT</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: projectedMonthProfit > 0 ? C.green : C.redBright, lineHeight: 1, marginTop: 8 }}>
                      {fmtD(Math.round(projectedMonthProfit))}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>{projectedMargin.toFixed(1)}% margin</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30 }}>PROJECTED REVENUE</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: C.white, lineHeight: 1, marginTop: 8 }}>
                      {fmtD(Math.round(projectedMonthRevenue))}
                    </div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>at this pace</div>
                  </div>
                </div>
              </div>

              {/* At This Pace Summary */}
              <div style={{
                background: projectedMonthProfit > 0 ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${projectedMonthProfit > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
                borderRadius: 6, padding: "14px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
              }}>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white70 }}>
                  {profitDays > 0
                    ? `You break even on Day ${breakevenCalendarDay}, leaving ${profitDays} work days of pure profit at ${fmtD(Math.round(boardRevTotalDaily))}/day.`
                    : `At this board pace, you don't break even this month. You need more calls or higher tickets.`
                  }
                </div>
              </div>
            </div>

            {/* ═══ WHAT-IF SIMULATOR ═══ */}
            <div style={{
              background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8,
              padding: 24, marginBottom: 28, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                background: C.amber,
              }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.black, letterSpacing: "0.1em",
                    background: C.amber, padding: "3px 10px", borderRadius: 3,
                  }}>SIMULATE</span>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>
                    WHAT-IF SIMULATOR
                  </h2>
                </div>
                <button className="jbtn" onClick={resetWhatIf} style={{
                  padding: "6px 16px", borderRadius: 4, border: `1px solid ${C.white08}`,
                  background: "transparent", color: C.white50, fontSize:12, cursor: "pointer",
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.1em",
                }}>RESET</button>
              </div>

              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white50, marginBottom: 20 }}>
                Adjust the sliders to see how changes ripple through your rate, revenue, and breakeven day.
              </p>

              {/* Adjustment Inputs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { key: "addTechs", label: "ADD / REMOVE TECHS", value: whatIf.addTechs, prefix: whatIf.addTechs >= 0 ? "+" : "", color: C.blue },
                  { key: "ticketBump", label: "AVG TICKET BUMP", value: whatIf.ticketBump, prefix: "$", suffix: "", color: C.green },
                  { key: "closeRateAdj", label: "CLOSE RATE ADJ", value: whatIf.closeRateAdj, prefix: whatIf.closeRateAdj >= 0 ? "+" : "", suffix: "%", color: C.amber },
                  { key: "efficiencyAdj", label: "EFFICIENCY ADJ", value: whatIf.efficiencyAdj, prefix: whatIf.efficiencyAdj >= 0 ? "+" : "", suffix: "%", color: C.white },
                ].map(s => (
                  <div key={s.key} style={{
                    background: C.white02, borderRadius: 6, padding: "16px", textAlign: "center",
                    border: `1px solid ${C.white04}`,
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30, marginBottom: 8 }}>{s.label}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                      {s.prefix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: s.color }}>{s.prefix}</span>}
                      <input type="number" value={s.value}
                        onChange={e => updateWhatIf(s.key, e.target.value)}
                        style={{
                          width: 60, border: "none", borderBottom: `2px solid ${s.color}`,
                          background: "transparent", color: C.white, fontSize: 32,
                          fontFamily: "'Bebas Neue', sans-serif", textAlign: "center", outline: "none",
                        }} />
                      {s.suffix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: s.color }}>{s.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Results: Current vs What-If */}
              <div style={{
                background: C.white02, border: `1px solid ${C.white04}`, borderRadius: 6,
                overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr 1fr", background: C.white04 }}>
                  <div style={{ padding: "10px 14px" }} />
                  <div style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30 }}>CURRENT</div>
                  <div style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.amber }}>WHAT-IF</div>
                  <div style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30 }}>IMPACT</div>
                </div>
                {/* Rows */}
                {[
                  { label: "HOURLY RATE", current: fmt(trueHourlyRate), whatif: fmt(wiRate), delta: wiRateDelta, isMoney: true },
                  { label: "MONTHLY REV", current: fmtD(Math.round(projectedMonthRevenue)), whatif: fmtD(Math.round(wiMonthlyRev)), delta: wiRevDelta, isMoney: true },
                  { label: "MONTHLY PROFIT", current: fmtD(Math.round(projectedMonthProfit)), whatif: fmtD(Math.round(wiMonthlyProfit)), delta: wiProfitDelta, isMoney: true },
                  { label: "BREAKEVEN DAY", current: `Day ${breakevenCalendarDay}`, whatif: `Day ${wiBreakevenCalDay}`, delta: wiBreakevenDelta, invert: true },
                  { label: "TECHS", current: settings.numTechs.toString(), whatif: wiTechs.toString(), delta: whatIf.addTechs },
                  { label: "CLOSE RATE", current: `${revenue.closeRate}%`, whatif: `${Math.min(revenue.closeRate + whatIf.closeRateAdj, 100)}%`, delta: whatIf.closeRateAdj },
                  { label: "EFFICIENCY", current: `${settings.efficiencyRate}%`, whatif: `${wiEfficiency}%`, delta: whatIf.efficiencyAdj },
                ].map((row, i) => {
                  const isGood = row.invert ? row.delta < 0 : row.delta > 0;
                  const isBad = row.invert ? row.delta > 0 : row.delta < 0;
                  return (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "140px 1fr 1fr 1fr",
                      borderBottom: `1px solid ${C.white04}`,
                      background: i % 2 === 0 ? "transparent" : C.white02,
                    }}>
                      <div style={{ padding: "12px 14px", fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.06em", color: C.white70 }}>{row.label}</div>
                      <div style={{ padding: "12px 14px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: C.white50 }}>{row.current}</div>
                      <div style={{
                        padding: "12px 14px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700,
                        color: row.delta !== 0 ? C.amber : C.white50,
                        background: row.delta !== 0 ? "rgba(245,158,11,0.04)" : "transparent",
                      }}>{row.whatif}</div>
                      <div style={{
                        padding: "12px 14px", textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700,
                        color: row.delta === 0 ? C.white15 : isGood ? C.green : isBad ? C.redBright : C.white,
                      }}>
                        {row.delta === 0 ? "—" : row.isMoney
                          ? `${row.delta > 0 ? "+" : ""}${fmtD(Math.round(row.delta))}`
                          : `${row.delta > 0 ? "+" : ""}${row.delta}`
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══ P&L BENCHMARKS ═══ */}
            <div style={{
              background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8,
              padding: 24, marginBottom: 28, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: C.white }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.black, letterSpacing: "0.1em",
                    background: C.white, padding: "3px 10px", borderRadius: 3,
                  }}>P&L</span>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>
                    BENCHMARK ANALYSIS
                  </h2>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white15 }}>
                  vs {fmtD(Math.round(benchmarkRevenue))}/mo revenue
                </span>
              </div>

              {/* Scorecard Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                <div style={{ background: C.white02, borderRadius: 6, padding: "14px", textAlign: "center", border: `1px solid ${C.white04}` }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30 }}>NET PROFIT</div>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, lineHeight: 1, margin: "4px 0",
                    color: plData.profitStatus === "STRONG" ? C.green : plData.profitStatus === "OK" ? C.green : plData.profitStatus === "LOW" ? C.amber : C.redBright,
                  }}>{plData.netProfitPct.toFixed(1)}%</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>target: {plData.profitBm[0]}-{plData.profitBm[1]}%</div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, marginTop: 4,
                    padding: "2px 8px", borderRadius: 3, display: "inline-block",
                    background: plData.profitStatus === "STRONG" || plData.profitStatus === "OK" ? C.greenSub : plData.profitStatus === "LOW" ? C.amberSub : "rgba(239,68,68,0.12)",
                    color: plData.profitStatus === "STRONG" || plData.profitStatus === "OK" ? C.green : plData.profitStatus === "LOW" ? C.amber : C.redBright,
                  }}>{plData.profitStatus}</div>
                </div>
                <div style={{ background: C.white02, borderRadius: 6, padding: "14px", textAlign: "center", border: `1px solid ${C.white04}` }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30 }}>TOTAL COST %</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: C.white, lineHeight: 1, margin: "4px 0" }}>{plData.totalCostPct.toFixed(1)}%</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>of revenue</div>
                </div>
                <div style={{ background: C.greenSub, borderRadius: 6, padding: "14px", textAlign: "center", border: `1px solid rgba(34,197,94,0.12)` }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.green }}>IN RANGE</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: C.green, lineHeight: 1, margin: "4px 0" }}>{plData.okCount}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>categories</div>
                </div>
                <div style={{
                  background: (plData.overCount + plData.underCount) > 0 ? "rgba(239,68,68,0.06)" : C.greenSub,
                  borderRadius: 6, padding: "14px", textAlign: "center",
                  border: `1px solid ${(plData.overCount + plData.underCount) > 0 ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)"}`,
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: (plData.overCount + plData.underCount) > 0 ? C.redBright : C.green }}>OUT OF RANGE</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: (plData.overCount + plData.underCount) > 0 ? C.redBright : C.green, lineHeight: 1, margin: "4px 0" }}>{plData.overCount + plData.underCount}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>{plData.overCount} over · {plData.underCount} under</div>
                </div>
              </div>

              {/* Line-by-Line Benchmark Table */}
              <div style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${C.white04}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 70px 90px 70px", background: C.white04, padding: "10px 14px" }}>
                  {["CATEGORY", "% OF REVENUE", "ACTUAL", "BENCHMARK", "STATUS"].map(h => (
                    <div key={h} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30, textAlign: h === "STATUS" ? "center" : "left" }}>{h}</div>
                  ))}
                </div>
                {plData.items.map((item, i) => {
                  const statusColor = item.status === "OK" ? C.green : (item.status === "HIGH" || item.status === "OVER") ? C.redBright : C.amber;
                  const barMax = item.high * 1.5 || 10;
                  const barWidth = Math.min(item.pctOfRev / barMax * 100, 100);
                  const benchLowPos = item.low / barMax * 100;
                  const benchHighPos = Math.min(item.high / barMax * 100, 100);
                  return (
                    <div key={item.key} className="jrow" style={{
                      display: "grid", gridTemplateColumns: "160px 1fr 70px 90px 70px", padding: "8px 14px",
                      alignItems: "center", borderBottom: `1px solid ${C.white04}`,
                      background: i % 2 === 0 ? "transparent" : C.white02, transition: "background 0.15s",
                    }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, fontWeight: 600, color: item.layer ? (item.layer === 1 ? C.red : C.amber) : C.white70 }}>{item.label}</span>
                      <div style={{ padding: "0 10px", position: "relative" }}>
                        <div style={{ height: 5, background: C.white04, borderRadius: 3, overflow: "hidden", position: "relative" }}>
                          <div style={{
                            position: "absolute", left: `${benchLowPos}%`, width: `${benchHighPos - benchLowPos}%`, height: "100%",
                            background: "rgba(34,197,94,0.12)",
                          }} />
                          <div style={{
                            height: "100%", width: `${barWidth}%`, borderRadius: 3,
                            background: item.status === "OK" ? C.green : (item.status === "HIGH" || item.status === "OVER") ? C.redBright : C.amber,
                            transition: "width 0.4s ease", position: "relative", zIndex: 1,
                          }} />
                        </div>
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, fontWeight: 600, color: statusColor }}>{item.pctOfRev.toFixed(1)}%</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white30 }}>{item.low}-{item.high}%</span>
                      <div style={{ textAlign: "center" }}>
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                          padding: "2px 6px", borderRadius: 2, letterSpacing: "0.06em",
                          background: item.status === "OK" ? C.greenSub : (item.status === "HIGH" || item.status === "OVER") ? "rgba(239,68,68,0.12)" : C.amberSub,
                          color: statusColor,
                        }}>{item.status}</span>
                      </div>
                    </div>
                  );
                })}
                {/* Net Profit Row */}
                <div style={{
                  display: "grid", gridTemplateColumns: "160px 1fr 70px 90px 70px", padding: "10px 14px",
                  alignItems: "center", borderTop: `2px solid ${C.white08}`,
                  background: plData.profitStatus === "STRONG" || plData.profitStatus === "OK" ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)",
                }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, fontWeight: 700, color: C.white }}>Net Profit</span>
                  <div style={{ padding: "0 10px" }}>
                    <div style={{ height: 5, background: C.white04, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${Math.min(plData.netProfitPct / 30 * 100, 100)}%`, borderRadius: 3,
                        background: plData.profitStatus === "STRONG" || plData.profitStatus === "OK" ? C.green : plData.profitStatus === "LOW" ? C.amber : C.redBright,
                      }} />
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700,
                    color: plData.profitStatus === "STRONG" || plData.profitStatus === "OK" ? C.green : plData.profitStatus === "LOW" ? C.amber : C.redBright,
                  }}>{plData.netProfitPct.toFixed(1)}%</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white30 }}>{plData.profitBm[0]}-{plData.profitBm[1]}%</span>
                  <div style={{ textAlign: "center" }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                      padding: "2px 6px", borderRadius: 2,
                      background: plData.profitStatus === "STRONG" || plData.profitStatus === "OK" ? C.greenSub : plData.profitStatus === "LOW" ? C.amberSub : "rgba(239,68,68,0.12)",
                      color: plData.profitStatus === "STRONG" || plData.profitStatus === "OK" ? C.green : plData.profitStatus === "LOW" ? C.amber : C.redBright,
                    }}>{plData.profitStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ CASH FLOW TIMING ═══ */}
            <div style={{ background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8, padding: 24, marginBottom: 28, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: C.amber }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.black, background: C.amber, padding: "3px 10px", borderRadius: 3, letterSpacing: "0.1em" }}>CASH</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>RECEIVABLES & CASH FLOW</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "0-30 DAYS", value: cashFlow.current0to30, key: "current0to30", color: C.green },
                  { label: "31-60 DAYS", value: cashFlow.aging31to60, key: "aging31to60", color: C.amber },
                  { label: "61-90 DAYS", value: cashFlow.aging61to90, key: "aging61to90", color: C.redBright },
                  { label: "90+ DAYS", value: cashFlow.aging90plus, key: "aging90plus", color: C.redBright },
                ].map(a => (
                  <div key={a.key} style={{ background: C.white02, borderRadius: 6, padding: "14px", border: `1px solid ${C.white04}`, textAlign: "center" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: a.color }}>{a.label}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, margin: "6px 0" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.white30 }}>$</span>
                      <input type="number" value={a.value} onChange={e => updateCashFlow(a.key, e.target.value)}
                        style={{ width: 70, border: "none", borderBottom: `1px solid ${C.white08}`, background: "transparent", color: C.white, fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: "center", outline: "none" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div style={{ background: C.white02, borderRadius: 6, padding: "12px", textAlign: "center", border: `1px solid ${C.white04}` }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.white30 }}>TOTAL A/R</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: C.white }}>{fmtD(totalReceivables)}</div>
                </div>
                <div style={{ background: C.white02, borderRadius: 6, padding: "12px", textAlign: "center", border: `1px solid ${C.white04}` }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.white30 }}>AT RISK (60d+)</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: atRiskReceivables > 5000 ? C.redBright : C.amber }}>{fmtD(atRiskReceivables)}</div>
                </div>
                <div style={{ background: C.white02, borderRadius: 6, padding: "12px", textAlign: "center", border: `1px solid ${C.white04}` }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.white30 }}>COLLECTIBLE %</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: collectiblePct > 85 ? C.green : C.amber }}>{collectiblePct.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {/* ═══ MEMBERSHIP HEALTH ═══ */}
            <div style={{ background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8, padding: 24, marginBottom: 28, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: C.green }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.black, background: C.green, padding: "3px 10px", borderRadius: 3, letterSpacing: "0.1em" }}>MEMBERS</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>MEMBERSHIP HEALTH</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "TOTAL MEMBERS", value: membership.totalMembers, key: "totalMembers", color: C.white },
                  { label: "NEW THIS MONTH", value: membership.newThisMonth, key: "newThisMonth", color: C.green },
                  { label: "CANCELLED", value: membership.cancelledThisMonth, key: "cancelledThisMonth", color: C.redBright },
                  { label: "DUE FOR SERVICE", value: membership.dueForService, key: "dueForService", color: C.amber },
                  { label: "AVG REV / MEMBER", value: membership.avgRevenuePerMember, key: "avgRevenuePerMember", color: C.white, prefix: "$" },
                  { label: "ANNUAL RENEWAL %", value: membership.annualRenewalRate, key: "annualRenewalRate", color: C.green, suffix: "%" },
                ].map(m => (
                  <div key={m.key} style={{ background: C.white02, borderRadius: 6, padding: "12px", textAlign: "center", border: `1px solid ${C.white04}` }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: m.color }}>{m.label}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, margin: "4px 0" }}>
                      {m.prefix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.white30 }}>{m.prefix}</span>}
                      <input type="number" value={m.value} onChange={e => updateMembership(m.key, e.target.value)}
                        style={{ width: 60, border: "none", borderBottom: `1px solid ${C.white08}`, background: "transparent", color: C.white, fontSize: 22, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: "center", outline: "none" }} />
                      {m.suffix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.white30 }}>{m.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { label: "NET GROWTH", value: `${memberNetGrowth > 0 ? "+" : ""}${memberNetGrowth}`, color: memberNetGrowth > 0 ? C.green : C.redBright },
                  { label: "CHURN RATE", value: `${memberChurnRate.toFixed(1)}%/mo`, color: memberChurnRate > 3 ? C.redBright : memberChurnRate > 2 ? C.amber : C.green },
                  { label: "MEMBER LTV", value: fmtD(Math.round(memberLTV)), color: C.white },
                  { label: "ANNUAL REV", value: fmtD(memberAnnualRevenue), color: C.green },
                ].map((s, i) => (
                  <div key={i} style={{ background: C.white02, borderRadius: 6, padding: "12px", textAlign: "center", border: `1px solid ${C.white04}` }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.white30 }}>{s.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ MONTHLY SCORECARD ═══ */}
            <div style={{ background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8, padding: 24, marginBottom: 28, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: scorecardGrade === "A" ? C.green : scorecardGrade === "B" ? C.green : scorecardGrade === "C" ? C.amber : C.redBright }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.black, background: C.white, padding: "3px 10px", borderRadius: 3, letterSpacing: "0.1em" }}>REPORT</span>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>MONTHLY SCORECARD</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1,
                    color: scorecardGrade === "A" ? C.green : scorecardGrade === "B" ? C.green : scorecardGrade === "C" ? C.amber : C.redBright,
                  }}>{scorecardGrade}</div>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.green }}>{scorecardPass} pass</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.redBright }}>{scorecardFail} fail</div>
                  </div>
                </div>
              </div>
              <div style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${C.white04}` }}>
                {scorecard.map((item, i) => (
                  <div key={i} className="jrow" style={{
                    display: "grid", gridTemplateColumns: "200px 1fr 100px 60px", padding: "10px 14px",
                    alignItems: "center", borderBottom: `1px solid ${C.white04}`,
                    background: i % 2 === 0 ? "transparent" : C.white02,
                  }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, fontWeight: 600, color: C.white70 }}>{item.label}</span>
                    <div style={{ padding: "0 10px" }}>
                      <div style={{ height: 4, background: C.white04, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 2, width: item.status === "PASS" ? "100%" : item.status === "WARN" ? "60%" : "30%",
                          background: item.status === "PASS" ? C.green : item.status === "WARN" ? C.amber : C.redBright,
                        }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: C.white, textAlign: "right" }}>
                      {item.isMoney ? fmtD(Math.round(item.actual)) : `${typeof item.actual === "number" ? item.actual.toFixed ? item.actual.toFixed(1) : item.actual : item.actual}${item.suffix || ""}`}
                    </span>
                    <div style={{ textAlign: "center" }}>
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                        padding: "2px 8px", borderRadius: 2,
                        background: item.status === "PASS" ? C.greenSub : item.status === "WARN" ? C.amberSub : "rgba(239,68,68,0.12)",
                        color: item.status === "PASS" ? C.green : item.status === "WARN" ? C.amber : C.redBright,
                      }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ KPI ALERTS ═══ */}
            <div style={{ background: C.blackCard, border: `1px solid ${activeAlerts.length > 0 ? "rgba(239,68,68,0.2)" : C.white08}`, borderRadius: 8, padding: 24, marginBottom: 28, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: activeAlerts.length > 0 ? C.redBright : C.green }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.black, background: activeAlerts.length > 0 ? C.redBright : C.green, padding: "3px 10px", borderRadius: 3, letterSpacing: "0.1em" }}>{activeAlerts.length > 0 ? "ALERT" : "CLEAR"}</span>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>KPI ALERT MONITOR</h2>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: activeAlerts.length > 0 ? C.redBright : C.green }}>{activeAlerts.length} active</span>
              </div>

              {activeAlerts.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {activeAlerts.map((a, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px",
                      background: a.severity === "HIGH" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                      border: `1px solid ${a.severity === "HIGH" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)"}`,
                      borderRadius: 6,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16 }}>{a.severity === "HIGH" ? "🔴" : "🟡"}</span>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600, color: C.white }}>{a.label}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: a.severity === "HIGH" ? C.redBright : C.amber }}>{a.value}</span>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginLeft: 8 }}>threshold: {a.threshold}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0", marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: C.green }}>All KPIs within thresholds</span>
                </div>
              )}

              {/* Threshold Settings */}
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30, marginBottom: 10 }}>ALERT THRESHOLDS — EDITABLE</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { key: "minCloseRate", label: "MIN CLOSE RATE", suffix: "%" },
                  { key: "maxMarketingPct", label: "MAX MARKETING %", suffix: "%" },
                  { key: "minDailyRevenue", label: "MIN DAILY REV", prefix: "$" },
                  { key: "minAvgTicket", label: "MIN AVG TICKET", prefix: "$" },
                  { key: "maxCallbackPct", label: "MAX CALLBACK %", suffix: "%" },
                  { key: "maxAgingOver60", label: "MAX A/R 60d+", prefix: "$" },
                ].map(t => (
                  <div key={t.key} style={{ background: C.white02, borderRadius: 4, padding: "10px 12px", border: `1px solid ${C.white04}` }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.white30, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {t.prefix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white30 }}>{t.prefix}</span>}
                      <input type="number" value={kpiAlerts[t.key]} onChange={e => updateKpiAlert(t.key, e.target.value)}
                        style={{ width: "100%", border: "none", borderBottom: `1px solid ${C.white08}`, background: "transparent", color: C.white, fontSize: 16, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none" }} />
                      {t.suffix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white30 }}>{t.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8,
              padding: 24, marginBottom: 28, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                background: `linear-gradient(180deg, ${C.red}, ${C.amber}, ${C.green})`,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: C.black, letterSpacing: "0.1em",
                  background: `linear-gradient(90deg, ${C.red}, ${C.amber})`, padding: "3px 10px", borderRadius: 3,
                }}>LAYER 3</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: "0.08em", color: C.white, margin: 0 }}>
                  STRATEGIC INTELLIGENCE
                </h2>
              </div>

              {/* ── DEPARTMENT SPLIT ── */}
              <div style={{
                background: C.white02, border: `1px solid ${C.white04}`, borderRadius: 6,
                padding: "20px", marginBottom: 16,
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.2em", color: C.white30, marginBottom: 14 }}>
                  DEPARTMENT RATE SPLIT
                </div>
                <div style={{ display: "flex", gap: 0, height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 16 }}>
                  <div style={{ width: `${deptSplit.plumbingPct}%`, background: C.red, transition: "width 0.4s" }} />
                  <div style={{ width: `${deptSplit.hvacPct}%`, background: C.blue, transition: "width 0.4s" }} />
                  <div style={{ width: `${deptSplit.electricalPct}%`, background: C.amber, transition: "width 0.4s" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "PLUMBING", color: C.red, bg: "rgba(220,38,38,0.04)", rate: plumbingRate, techs: deptSplit.plumbingTechs, costs: plumbingCosts, hours: plumbingHours, pct: deptSplit.plumbingPct },
                    { label: "HVAC", color: C.blue, bg: "rgba(59,130,246,0.04)", rate: hvacRate, techs: deptSplit.hvacTechs, costs: hvacCosts, hours: hvacHours, pct: deptSplit.hvacPct },
                    { label: "ELECTRICAL", color: C.amber, bg: "rgba(245,158,11,0.04)", rate: electricalRate, techs: deptSplit.electricalTechs, costs: electricalCosts, hours: electricalHours, pct: deptSplit.electricalPct },
                  ].map(d => (
                    <div key={d.label} style={{ textAlign: "center", padding: "16px", background: d.bg, borderRadius: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, color: d.color, letterSpacing: "0.1em" }}>{d.label}</span>
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: C.white, lineHeight: 1 }}>{fmt(d.rate)}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginTop: 4 }}>
                        {d.techs} techs · {d.pct}% costs · {Math.round(d.hours)} hrs
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white30, marginTop: 12, fontStyle: "italic", textAlign: "center" }}>
                  Blended rate: {fmt(trueHourlyRate)} · Spread: {fmt(rateDiff)} between highest and lowest
                </div>
              </div>

              {/* ── SEASONAL RATE CHART ── */}
              <div style={{
                background: C.white02, border: `1px solid ${C.white04}`, borderRadius: 6,
                padding: "20px", marginBottom: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.2em", color: C.white30 }}>
                    SEASONAL RATE ADJUSTMENT — 12 MONTH VIEW
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>
                    Peak: {peakMonth.month} ({peakMonth.mult}%) · Slow: {slowMonth.month} ({slowMonth.mult}%)
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4, alignItems: "flex-end", height: 120, marginBottom: 8 }}>
                  {seasonalRates.map((m, i) => {
                    const maxRate = Math.max(...seasonalRates.map(s => s.rate));
                    const minRate = Math.min(...seasonalRates.map(s => s.rate));
                    const range = maxRate - minRate || 1;
                    const height = 20 + ((m.rate - minRate) / range) * 80;
                    const isCurrent = m.month === currentMonthKey;
                    return (
                      <div key={m.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize:12, fontWeight: 700,
                          color: isCurrent ? C.red : C.white30,
                        }}>${m.rate}</span>
                        <div style={{
                          width: "100%", height: `${height}%`, borderRadius: "3px 3px 0 0",
                          background: isCurrent
                            ? `linear-gradient(180deg, ${C.red}, ${C.redDark})`
                            : m.mult >= 100
                              ? `linear-gradient(180deg, rgba(34,197,94,0.4), rgba(34,197,94,0.1))`
                              : `linear-gradient(180deg, rgba(245,158,11,0.4), rgba(245,158,11,0.1))`,
                          transition: "height 0.4s ease",
                        }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4 }}>
                  {seasonalRates.map(m => (
                    <div key={m.month} style={{ textAlign: "center" }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                        color: m.month === currentMonthKey ? C.red : C.white15,
                      }}>{m.month}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white08 }}>{m.mult}%</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white30, marginTop: 12, fontStyle: "italic", textAlign: "center" }}>
                  Your rate should be {fmt(slowMonth.rate)} in {slowMonth.month} and {fmt(peakMonth.rate)} in {peakMonth.month} — a {fmt(slowMonth.rate - peakMonth.rate)} swing
                </div>
              </div>

              {/* ── CUSTOMER ACQUISITION COST ── */}
              <div style={{
                background: C.white02, border: `1px solid ${C.white04}`, borderRadius: 6,
                padding: "20px", marginBottom: 16,
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.2em", color: C.white30, marginBottom: 14 }}>
                  CUSTOMER ACQUISITION COST (CAC)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "CAC", value: fmt(cac), sub: "per new customer", color: cac > 200 ? C.redBright : cac > 100 ? C.amber : C.green },
                    { label: "LTV", value: fmtD(Math.round(ltv)), sub: `~${lifetimeJobsEstimate} jobs lifetime`, color: C.white },
                    { label: "LTV : CAC", value: `${ltvToCac.toFixed(1)}x`, sub: ltvToCac >= 5 ? "Excellent" : ltvToCac >= 3 ? "Healthy" : "Watch this", color: ltvToCac >= 5 ? C.green : ltvToCac >= 3 ? C.amber : C.redBright },
                    { label: "ANNUAL CAC SPEND", value: fmtD(Math.round(cacAnnual)), sub: `${acquisition.newCustomersPerMonth * 12} new customers/yr`, color: C.white },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white15 }}>{s.label}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: s.color, margin: "4px 0" }}>{s.value}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 0, height: 8, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(cac / ltv * 100, 100)}%`, background: C.red, transition: "width 0.4s" }} />
                  <div style={{ flex: 1, background: C.greenSub }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.red }}>Acquisition cost</span>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.green }}>Lifetime profit</span>
                </div>
              </div>

              {/* ── CULTURE & TRAINING ── */}
              <div style={{
                background: C.white02, border: `1px solid ${C.white04}`, borderRadius: 6,
                padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.amber }}>CULTURE & TRAINING INVESTMENT</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30 }}>Team events + certifications — the costs that retain your techs</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.white }}>{fmtD(layer3Total)}/mo</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15 }}>monthly</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: C.white08 }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.white }}>{fmtD(layer3Total * 12)}/yr</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15 }}>annual</div>
                  </div>
                  <div style={{ width: 1, height: 28, background: C.white08 }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.amber }}>{fmtD(Math.round(layer3Total / settings.numTechs))}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15 }}>per tech/mo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white }}>COST BREAKDOWN</h2>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white30 }}>% of total operating costs</span>
              </div>
              {costPctData.map((cat, i) => (
                <div key={cat.key} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "10px 0",
                  borderBottom: `1px solid ${C.white04}`,
                  animation: "slideIn 0.3s ease", animationDelay: `${i * 0.04}s`, animationFillMode: "both",
                }}>
                  <div style={{ width: 180, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 600, color: cat.layer ? C.red : C.white70 }}>{cat.label}</span>
                    {cat.layer && <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize:12, fontWeight: 700,
                      padding: "1px 5px", borderRadius: 2, background: C.redSubtle, color: C.red,
                      letterSpacing: "0.06em",
                    }}>L1</span>}
                  </div>
                  <div style={{ flex: 1, height: 6, background: C.white04, borderRadius: 1, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${cat.pct}%`, borderRadius: 1,
                      background: cat.layer
                        ? `linear-gradient(90deg, ${C.red}, #ff6b6b)`
                        : `linear-gradient(90deg, ${C.white30}, ${C.white15})`,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.white50, width: 45, textAlign: "right" }}>{cat.pct.toFixed(1)}%</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: C.white, width: 80, textAlign: "right" }}>{fmtD(cat.value)}</span>
                </div>
              ))}
            </div>

            {/* Data Alerts */}
            {dataAlerts.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, marginBottom: 14 }}>
                  DATA QUALITY ALERTS <span style={{ color: C.red, fontSize: 18 }}>({dataAlerts.length})</span>
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                  {dataAlerts.map((a, i) => {
                    const col = a.type === "missing" ? C.redBright : a.type === "stale" ? C.amber : C.blue;
                    return (
                      <div key={i} style={{
                        background: C.blackCard, borderRadius: 6, padding: "14px 16px",
                        borderLeft: `3px solid ${col}`, display: "flex", flexDirection: "column", gap: 3,
                      }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: col }}>{a.type.toUpperCase()}</span>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, fontWeight: 600, color: C.white }}>{a.label}</span>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white30 }}>{a.msg}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ AI AGENT ══════ */}
        {activeTab === "agent" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.red, boxShadow: `0 0 8px ${C.red}`, animation: agentLoading ? "statusPulse 1s infinite" : "none" }} />
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: "0.08em", color: C.white, margin: 0 }}>CoDB AGENT</h2>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, color: C.white30, letterSpacing: "0.1em" }}>POWERED BY CLAUDE</span>
            </div>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 24 }}>
              Your financial analyst. Reads every number in this app and tells you what to do about it.
            </p>

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Full Monthly Analysis", prompt: "Analyze my entire business snapshot. What's working, what's broken, and what are the top 3 things I need to fix this month? Be specific with numbers.", color: C.red },
                { label: "Rate Recommendation", prompt: "Should I approve this True Hourly Rate or adjust it? Walk me through the math and tell me if my rate is too high, too low, or right. Compare against my costs and revenue targets.", color: C.white },
                { label: "Board Diagnosis", prompt: "Look at today's dispatch board. Am I going to hit my daily revenue target? If not, exactly how many more calls do I need and in which departments? What's the weakest spot?", color: C.blue },
                { label: "Cash Flow Check", prompt: "Analyze my receivables and cash flow. Am I sitting on too much aging debt? What's my collection risk and what should I do about it this week?", color: C.amber },
                { label: "Membership Strategy", prompt: "Evaluate my membership program health. Is my churn rate acceptable? Am I growing fast enough? What's the revenue impact if I reduce churn by 1%? Give me 3 actions to take this month.", color: C.green },
                { label: "P&L Red Flags", prompt: "Look at my P&L benchmarks. Which cost categories are out of range and what's the dollar impact? What should I cut, what should I increase, and what's fine? Prioritize by impact.", color: C.redBright },
                { label: "Breakeven Strategy", prompt: "My breakeven day is Day " + breakevenCalendarDay + ". Is that good or bad? What specific changes would move it earlier? Model 3 scenarios for me.", color: C.white },
                { label: "Department Profitability", prompt: "Compare my plumbing, HVAC, and electrical departments. Which one is most profitable? Which one is dragging? Should I shift costs or techs between departments?", color: C.red },
              ].map((action, i) => (
                <button key={i} className="jbtn" onClick={() => runAgent(action.prompt)}
                  disabled={agentLoading}
                  style={{
                    padding: "16px", borderRadius: 6, border: `1px solid ${C.white08}`,
                    background: C.blackCard, color: C.white, cursor: agentLoading ? "wait" : "pointer",
                    fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600,
                    textAlign: "left", transition: "all 0.2s", opacity: agentLoading ? 0.5 : 1,
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: action.color }} />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: action.color }}>{action.label.toUpperCase()}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Prompt */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30, marginBottom: 8 }}>ASK THE AGENT ANYTHING</div>
              <div style={{ display: "flex", gap: 10 }}>
                <input type="text" id="agentInput" placeholder="e.g., What happens if I lose a tech next month?"
                  onKeyDown={e => { if (e.key === "Enter" && e.target.value) { runAgent(e.target.value); e.target.value = ""; } }}
                  style={{
                    flex: 1, padding: "14px 16px", borderRadius: 6, border: `1px solid ${C.white08}`,
                    background: C.white02, color: C.white, fontSize: 14,
                    fontFamily: "'Barlow', sans-serif", outline: "none",
                  }} />
                <button className="jbtn" onClick={() => { const el = document.getElementById("agentInput"); if (el.value) { runAgent(el.value); el.value = ""; } }}
                  disabled={agentLoading}
                  style={{
                    padding: "14px 24px", borderRadius: 6, border: "none",
                    background: C.red, color: C.white, cursor: agentLoading ? "wait" : "pointer",
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                    letterSpacing: "0.1em",
                  }}>
                  {agentLoading ? "THINKING..." : "RUN AGENT"}
                </button>
              </div>
            </div>

            {/* Agent Response */}
            {(agentAnalysis || agentLoading) && (
              <div style={{
                background: C.blackCard, border: `1px solid ${agentLoading ? "rgba(220,38,38,0.2)" : C.white08}`,
                borderRadius: 8, padding: 24, marginBottom: 24, borderLeft: `3px solid ${C.red}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, animation: agentLoading ? "statusPulse 0.8s infinite" : "none" }} />
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.1em", color: C.red }}>
                    {agentLoading ? "AGENT ANALYZING..." : "AGENT ANALYSIS"}
                  </span>
                </div>
                {agentLoading ? (
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: C.white30, fontStyle: "italic" }}>
                    Reading your business snapshot and running analysis...
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: C.white90, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {agentAnalysis.split("**").map((part, i) =>
                      i % 2 === 1
                        ? <strong key={i} style={{ color: C.white, fontWeight: 700, display: "block", marginTop: 12, marginBottom: 4, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, letterSpacing: "0.04em" }}>{part}</strong>
                        : <span key={i}>{part}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Agent History */}
            {agentHistory.length > 0 && (
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.white30, marginBottom: 10 }}>AGENT HISTORY</div>
                {agentHistory.map((entry, i) => (
                  <div key={i} style={{
                    background: C.white02, borderRadius: 6, padding: "12px 16px", marginBottom: 8,
                    border: `1px solid ${C.white04}`, cursor: "pointer",
                  }} onClick={() => setAgentAnalysis(entry.response)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white70, maxWidth: "80%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.prompt.substring(0, 80)}...
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white15 }}>{entry.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════ COST ENGINE ══════ */}
        {activeTab === "costs" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, marginBottom: 4 }}>BUSINESS PARAMETERS</h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 18 }}>Operational settings that drive your rate calculation</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 32 }}>
              {[
                { key: "numTechs", label: "REVENUE TECHS", suffix: "" },
                { key: "hoursPerDay", label: "HOURS / DAY", suffix: "hrs" },
                { key: "efficiencyRate", label: "EFFICIENCY", suffix: "%" },
                { key: "profitMargin", label: "PROFIT TARGET", suffix: "%" },
                { key: "holidays", label: "HOLIDAYS", suffix: "days" },
              ].map(s => (
                <div key={s.key} style={{
                  background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 6, padding: "14px 16px",
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="number" value={settings[s.key]} onChange={e => updateSetting(s.key, e.target.value)}
                      style={{
                        width: "100%", padding: "6px 0", border: "none", borderBottom: `1px solid ${C.white08}`,
                        background: "transparent", color: C.white, fontSize: 22,
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none",
                      }} />
                    {s.suffix && <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white30 }}>{s.suffix}</span>}
                  </div>
                </div>
              ))}
              <div style={{ background: C.redSubtle, border: `1px solid rgba(220,38,38,0.15)`, borderRadius: 6, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.red, marginBottom: 8 }}>WORK DAYS (AUTO)</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 600, color: C.white }}>{workDaysInMonth}</div>
              </div>
            </div>

            {/* Layer 2 — Revenue Targets */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize:12, color: C.black, letterSpacing: "0.1em",
                  background: C.white, padding: "2px 8px", borderRadius: 2,
                }}>LAYER 2</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, margin: 0 }}>REVENUE TARGETS</h2>
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 18 }}>
                The offense side — what you need to generate to make the math work
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 20 }}>
                {[
                  { key: "monthlyTarget", label: "MONTHLY REVENUE TARGET", prefix: "$" },
                  { key: "membershipRevenue", label: "MEMBERSHIP REVENUE / MO", prefix: "$" },
                  { key: "numTrucks", label: "NUMBER OF TRUCKS", prefix: "" },
                  { key: "closeRate", label: "CLOSE RATE", suffix: "%" },
                  { key: "installMixPct", label: "INSTALL MIX (TARGET)", suffix: "%" },
                ].map(r => (
                  <div key={r.key} style={{
                    background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 6, padding: "14px 16px",
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30, marginBottom: 8 }}>{r.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {r.prefix && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.white30 }}>{r.prefix}</span>}
                      <input type="number" value={revenue[r.key]}
                        onChange={e => updateRevenue(r.key, e.target.value)}
                        style={{
                          width: "100%", padding: "6px 0", border: "none", borderBottom: `1px solid ${C.white08}`,
                          background: "transparent", color: C.white, fontSize: 22,
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none",
                        }} />
                      {r.suffix && <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white30 }}>{r.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Average Job Tickets by Department */}
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white50, marginBottom: 12 }}>AVERAGE JOB TICKETS BY DEPARTMENT</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {/* Plumbing */}
                <div style={{ background: C.blackCard, borderRadius: 6, border: `1px solid rgba(220,38,38,0.15)`, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.06)", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: C.red }} />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, color: C.red, letterSpacing: "0.1em" }}>PLUMBING</span>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginBottom: 4 }}>Service Call Avg</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.white30 }}>$</span>
                        <input type="number" value={revenue.plumbingServiceTicket}
                          onChange={e => updateRevenue("plumbingServiceTicket", e.target.value)}
                          style={{ width: "100%", padding: "4px 0", border: "none", borderBottom: `1px solid rgba(220,38,38,0.2)`, background: "transparent", color: C.white, fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginBottom: 4 }}>Install Avg</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.white30 }}>$</span>
                        <input type="number" value={revenue.plumbingInstallTicket}
                          onChange={e => updateRevenue("plumbingInstallTicket", e.target.value)}
                          style={{ width: "100%", padding: "4px 0", border: "none", borderBottom: `1px solid rgba(220,38,38,0.2)`, background: "transparent", color: C.white, fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* HVAC */}
                <div style={{ background: C.blackCard, borderRadius: 6, border: `1px solid rgba(59,130,246,0.15)`, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: "rgba(59,130,246,0.06)", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: C.blue }} />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, color: C.blue, letterSpacing: "0.1em" }}>HVAC</span>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginBottom: 4 }}>Service Call Avg</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.white30 }}>$</span>
                        <input type="number" value={revenue.hvacServiceTicket}
                          onChange={e => updateRevenue("hvacServiceTicket", e.target.value)}
                          style={{ width: "100%", padding: "4px 0", border: "none", borderBottom: `1px solid rgba(59,130,246,0.2)`, background: "transparent", color: C.white, fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginBottom: 4 }}>Install Avg</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.white30 }}>$</span>
                        <input type="number" value={revenue.hvacInstallTicket}
                          onChange={e => updateRevenue("hvacInstallTicket", e.target.value)}
                          style={{ width: "100%", padding: "4px 0", border: "none", borderBottom: `1px solid rgba(59,130,246,0.2)`, background: "transparent", color: C.white, fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Electrical */}
                <div style={{ background: C.blackCard, borderRadius: 6, border: `1px solid rgba(245,158,11,0.15)`, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.06)", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: C.amber }} />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, color: C.amber, letterSpacing: "0.1em" }}>ELECTRICAL</span>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginBottom: 4 }}>Service Call Avg</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.white30 }}>$</span>
                        <input type="number" value={revenue.electricalServiceTicket}
                          onChange={e => updateRevenue("electricalServiceTicket", e.target.value)}
                          style={{ width: "100%", padding: "4px 0", border: "none", borderBottom: `1px solid rgba(245,158,11,0.2)`, background: "transparent", color: C.white, fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginBottom: 4 }}>Install Avg</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.white30 }}>$</span>
                        <input type="number" value={revenue.electricalInstallTicket}
                          onChange={e => updateRevenue("electricalInstallTicket", e.target.value)}
                          style={{ width: "100%", padding: "4px 0", border: "none", borderBottom: `1px solid rgba(245,158,11,0.2)`, background: "transparent", color: C.white, fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 3 — Strategic Intelligence Inputs */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize:12, color: C.black, letterSpacing: "0.1em",
                  background: `linear-gradient(90deg, ${C.red}, ${C.amber})`, padding: "2px 8px", borderRadius: 2,
                }}>LAYER 3</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, margin: 0 }}>STRATEGIC INTELLIGENCE</h2>
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 18 }}>
                Department split, seasonal adjustments, and customer acquisition
              </p>

              {/* Department Split */}
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.red, marginBottom: 10 }}>DEPARTMENT SPLIT</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 20 }}>
                {[
                  { key: "plumbingPct", label: "PLUMBING COST %", suffix: "%", color: "rgba(220,38,38,0.12)" },
                  { key: "hvacPct", label: "HVAC COST %", suffix: "%", color: "rgba(59,130,246,0.12)" },
                  { key: "electricalPct", label: "ELEC COST %", suffix: "%", color: "rgba(245,158,11,0.12)" },
                  { key: "plumbingTechs", label: "PLB TECHS", suffix: "", color: "rgba(220,38,38,0.12)" },
                  { key: "hvacTechs", label: "HVAC TECHS", suffix: "", color: "rgba(59,130,246,0.12)" },
                  { key: "electricalTechs", label: "ELEC TECHS", suffix: "", color: "rgba(245,158,11,0.12)" },
                ].map(s => (
                  <div key={s.key} style={{ background: C.blackCard, border: `1px solid ${s.color || C.white08}`, borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30, marginBottom: 8 }}>{s.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" value={deptSplit[s.key]} onChange={e => updateDeptSplit(s.key, e.target.value)}
                        style={{ width: "100%", padding: "6px 0", border: "none", borderBottom: `1px solid ${C.white08}`, background: "transparent", color: C.white, fontSize: 22, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none" }} />
                      {s.suffix && <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white30 }}>{s.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Seasonal Multipliers */}
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.amber, marginBottom: 10 }}>SEASONAL BILLABLE HOUR MULTIPLIERS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 20 }}>
                {MONTH_KEYS.map(m => (
                  <div key={m} style={{
                    background: m === currentMonthKey ? C.redSubtle : C.blackCard,
                    border: `1px solid ${m === currentMonthKey ? "rgba(220,38,38,0.2)" : C.white08}`,
                    borderRadius: 4, padding: "10px 8px", textAlign: "center",
                  }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, color: m === currentMonthKey ? C.red : C.white30, marginBottom: 4 }}>{m}</div>
                    <input type="number" value={seasonal[m]}
                      onChange={e => setSeasonal(prev => ({ ...prev, [m]: parseFloat(e.target.value) || 0 }))}
                      style={{
                        width: "100%", border: "none", borderBottom: `1px solid ${C.white08}`,
                        background: "transparent", color: C.white, fontSize: 16, textAlign: "center",
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none",
                      }} />
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15, marginTop: 2 }}>%</div>
                  </div>
                ))}
              </div>

              {/* Customer Acquisition */}
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.12em", color: C.green, marginBottom: 10 }}>CUSTOMER ACQUISITION</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                {[
                  { key: "newCustomersPerMonth", label: "NEW CUSTOMERS / MONTH", prefix: "" },
                  { key: "repeatCustomerPct", label: "REPEAT CUSTOMER %", suffix: "%" },
                ].map(s => (
                  <div key={s.key} style={{ background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 6, padding: "14px 16px" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30, marginBottom: 8 }}>{s.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" value={acquisition[s.key]}
                        onChange={e => setAcquisition(prev => ({ ...prev, [s.key]: parseFloat(e.target.value) || 0 }))}
                        style={{ width: "100%", padding: "6px 0", border: "none", borderBottom: `1px solid ${C.white08}`, background: "transparent", color: C.white, fontSize: 22, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: "none" }} />
                      {s.suffix && <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.white30 }}>{s.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, marginBottom: 4 }}>MONTHLY OPERATING COSTS</h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 18 }}>Base operating costs for {currentMonth}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
              {COST_CATEGORIES.filter(c => !c.layer).map((cat, i) => {
                const alert = dataAlerts.find(a => a.key === cat.key);
                const bColor = alert ? (alert.type === "missing" ? C.redBright : alert.type === "stale" ? C.amber : C.blue) : C.white08;
                return (
                  <div key={cat.key} className="jcard" style={{
                    background: C.blackCard, border: `1px solid ${bColor}`, borderRadius: 6,
                    padding: "18px", transition: "all 0.2s",
                    animation: "fadeUp 0.4s ease", animationDelay: `${i * 0.04}s`, animationFillMode: "both",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: C.white, letterSpacing: "0.02em" }}>{cat.label}</div>
                        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginTop: 1 }}>{cat.desc}</div>
                      </div>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize:12, fontWeight: 700,
                        padding: "3px 8px", borderRadius: 3, background: C.redSubtle, color: C.red,
                        letterSpacing: "0.06em",
                      }}>{cat.priority}</span>
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", background: C.white02,
                      border: `1px solid ${C.white08}`, borderRadius: 4, padding: "0 12px",
                    }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: C.white30 }}>$</span>
                      <input type="number" value={costs[cat.key]}
                        onChange={e => updateCost(cat.key, e.target.value)}
                        readOnly={!adjustMode && approved}
                        style={{
                          width: "100%", padding: "12px 8px", border: "none", background: "transparent",
                          color: C.white, fontSize: 22, fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600, outline: "none",
                        }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      {alert && <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, fontWeight: 600, color: bColor }}>⚠ {alert.msg}</span>}
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15, marginLeft: "auto" }}>
                        Updated {lastUpdated[cat.key]}d ago
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Layer 1 — Hidden Costs */}
            <div style={{ marginTop: 28, marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize:12, color: C.black, letterSpacing: "0.1em",
                  background: C.red, padding: "2px 8px", borderRadius: 2,
                }}>LAYER 1</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, margin: 0 }}>HIDDEN COST RECOVERY</h2>
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 18 }}>
                Costs most shops forget — your rate is wrong without them
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
                {COST_CATEGORIES.filter(c => c.layer === 1).map((cat, i) => {
                  const alert = dataAlerts.find(a => a.key === cat.key);
                  return (
                    <div key={cat.key} className="jcard" style={{
                      background: `linear-gradient(135deg, ${C.blackCard}, rgba(220,38,38,0.03))`,
                      border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 6,
                      padding: "18px", transition: "all 0.2s",
                      animation: "fadeUp 0.4s ease", animationDelay: `${i * 0.04}s`, animationFillMode: "both",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: C.red, letterSpacing: "0.02em" }}>{cat.label}</div>
                          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginTop: 1 }}>{cat.desc}</div>
                        </div>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize:12, fontWeight: 700,
                          padding: "3px 8px", borderRadius: 3, background: C.redSubtle, color: C.red,
                          letterSpacing: "0.06em",
                        }}>{cat.priority}</span>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", background: C.white02,
                        border: `1px solid rgba(220,38,38,0.15)`, borderRadius: 4, padding: "0 12px",
                      }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: C.red }}>$</span>
                        <input type="number" value={costs[cat.key]}
                          onChange={e => updateCost(cat.key, e.target.value)}
                          readOnly={!adjustMode && approved}
                          style={{
                            width: "100%", padding: "12px 8px", border: "none", background: "transparent",
                            color: C.white, fontSize: 22, fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600, outline: "none",
                          }} />
                      </div>
                      {alert && <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, fontWeight: 600, color: C.amber, display: "block", marginTop: 6 }}>⚠ {alert.msg}</span>}
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white15, display: "block", marginTop: 4 }}>
                        Updated {lastUpdated[cat.key]}d ago
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Layer 1 subtotal */}
              <div style={{
                marginTop: 12, padding: "12px 18px", borderRadius: 4,
                background: C.redSubtle, border: `1px solid rgba(220,38,38,0.15)`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: C.red }}>LAYER 1 SUBTOTAL</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.red }}>{fmtD(layer1Total)}/mo</span>
              </div>
            </div>

            {/* Layer 3 — Culture & Training Costs */}
            <div style={{ marginTop: 28, marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize:12, color: C.black, letterSpacing: "0.1em",
                  background: `linear-gradient(90deg, ${C.red}, ${C.amber})`, padding: "2px 8px", borderRadius: 2,
                }}>LAYER 3</span>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, margin: 0 }}>CULTURE & TRAINING</h2>
              </div>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 18 }}>
                The investment that keeps your techs from leaving
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 10 }}>
                {COST_CATEGORIES.filter(c => c.layer === 3).map((cat, i) => (
                  <div key={cat.key} className="jcard" style={{
                    background: `linear-gradient(135deg, ${C.blackCard}, rgba(245,158,11,0.03))`,
                    border: `1px solid rgba(245,158,11,0.15)`, borderRadius: 6,
                    padding: "18px", transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: C.amber, letterSpacing: "0.02em" }}>{cat.label}</div>
                        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white30, marginTop: 1 }}>{cat.desc}</div>
                      </div>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize:12, fontWeight: 700,
                        padding: "3px 8px", borderRadius: 3, background: C.amberSub, color: C.amber,
                      }}>L3</span>
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", background: C.white02,
                      border: `1px solid rgba(245,158,11,0.12)`, borderRadius: 4, padding: "0 12px",
                    }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: C.amber }}>$</span>
                      <input type="number" value={costs[cat.key]}
                        onChange={e => updateCost(cat.key, e.target.value)}
                        readOnly={!adjustMode && approved}
                        style={{
                          width: "100%", padding: "12px 8px", border: "none", background: "transparent",
                          color: C.white, fontSize: 22, fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600, outline: "none",
                        }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 12, padding: "12px 18px", borderRadius: 4,
                background: C.amberSub, border: `1px solid rgba(245,158,11,0.15)`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: C.amber }}>LAYER 3 SUBTOTAL</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.amber }}>{fmtD(layer3Total)}/mo</span>
              </div>
            </div>

            {/* Totals */}
            <div style={{
              marginTop: 24, padding: "20px 28px", borderRadius: 6,
              background: `linear-gradient(135deg, rgba(220,38,38,0.06), ${C.blackCard})`,
              border: `1px solid rgba(220,38,38,0.15)`,
              display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: 20,
            }}>
              {[
                { label: "TOTAL COSTS", value: fmtD(totalCosts), color: C.white },
                { label: "L1 RECOVERED", value: fmtD(layer1Total), color: C.red },
                { label: "L3 STRATEGIC", value: fmtD(layer3Total), color: C.amber },
                { label: "BILLABLE HRS", value: Math.round(billableHours).toString(), color: C.white },
                { label: "TRUE RATE", value: fmt(trueHourlyRate), color: C.red },
              ].map((t, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30 }}>{t.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, color: t.color }}>{t.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ PRICEBOOK IMPACT ══════ */}
        {activeTab === "pricebook" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, marginBottom: 4 }}>PRICEBOOK IMPACT ANALYSIS</h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 20 }}>
              {flaggedCount} flagged (±10%+) · Average change: {avgChange.toFixed(1)}%
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "ITEMS AFFECTED", value: pricebookImpact.length, color: C.white },
                { label: "FLAGGED FOR REVIEW", value: flaggedCount, color: flaggedCount > 0 ? C.amber : C.green },
                { label: "AVG PRICE CHANGE", value: avgChange.toFixed(1) + "%", color: avgChange > 5 ? C.redBright : C.white },
              ].map((s, i) => (
                <div key={i} style={{
                  background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 6,
                  padding: "20px", textAlign: "center",
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30 }}>{s.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ borderRadius: 6, overflow: "auto", border: `1px solid ${C.white08}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.blackCard }}>
                    {["SERVICE", "HRS", "OLD PRICE", "NEW PRICE", "CHANGE", ""].map((h, i) => (
                      <th key={i} style={{
                        textAlign: i === 0 ? "left" : "right", padding: "12px 14px",
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                        letterSpacing: "0.15em", color: C.white30, borderBottom: `1px solid ${C.white08}`,
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricebookImpact.map((item, i) => (
                    <tr key={item.id} className="jrow" style={{
                      background: i % 2 === 0 ? "transparent" : C.white02,
                      transition: "background 0.15s",
                    }}>
                      <td style={{ padding: "10px 14px", fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600, color: C.white, borderBottom: `1px solid ${C.white04}` }}>
                        {item.name}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.white50, borderBottom: `1px solid ${C.white04}` }}>{item.hours}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.white30, borderBottom: `1px solid ${C.white04}` }}>{fmtD(item.oldPrice)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: C.white, borderBottom: `1px solid ${C.white04}` }}>{fmtD(item.newPrice)}</td>
                      <td style={{
                        padding: "10px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
                        color: item.change > 0 ? C.redBright : item.change < 0 ? C.green : C.white30,
                        borderBottom: `1px solid ${C.white04}`,
                      }}>{item.change > 0 ? "+" : ""}{fmtD(item.change)} ({item.changePct.toFixed(1)}%)</td>
                      <td style={{ padding: "10px 14px", textAlign: "center", borderBottom: `1px solid ${C.white04}` }}>
                        {item.flagged ? (
                          <span style={{
                            fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                            padding: "3px 10px", borderRadius: 3, background: C.amberSub, color: C.amber,
                            letterSpacing: "0.08em",
                          }}>REVIEW</span>
                        ) : (
                          <span style={{
                            fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                            padding: "3px 10px", borderRadius: 3, background: C.greenSub, color: C.green,
                            letterSpacing: "0.08em",
                          }}>OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════ HISTORY ══════ */}
        {activeTab === "history" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, marginBottom: 4 }}>RATE HISTORY</h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 24 }}>6-month trend + current calculation</p>

            {/* Chart */}
            <div style={{
              background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 6,
              padding: "28px 20px 20px", marginBottom: 24, position: "relative",
            }}>
              <div style={{ position: "relative", height: 280 }}>
                {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                  const val = chartMin + (chartMax - chartMin) * (1 - pct);
                  return (
                    <div key={pct}>
                      <div style={{
                        position: "absolute", left: 0, top: `${pct * 100}%`, transform: "translateY(-50%)",
                        fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white15, width: 40, textAlign: "right",
                      }}>${Math.round(val)}</div>
                      <div style={{
                        position: "absolute", left: 50, right: 0, top: `${pct * 100}%`,
                        height: 1, background: C.white04,
                      }} />
                    </div>
                  );
                })}
                <div style={{
                  position: "absolute", left: 56, right: 8, top: 0, bottom: 30,
                  display: "flex", alignItems: "flex-end", gap: 8, justifyContent: "space-around",
                }}>
                  {[...HISTORICAL_RATES, { month: "Apr '26", rate: trueHourlyRate, costs: totalCosts, current: true }].map((h, i) => {
                    const height = ((h.rate - chartMin) / (chartMax - chartMin)) * 100;
                    return (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 6 }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700,
                          color: h.current ? C.red : C.white70,
                        }}>${Math.round(h.rate)}</span>
                        <div style={{
                          width: "100%", maxWidth: 44, height: `${height}%`, minHeight: 4, borderRadius: "3px 3px 0 0",
                          background: h.current
                            ? `linear-gradient(180deg, ${C.red}, ${C.redDark})`
                            : `linear-gradient(180deg, ${C.white15}, ${C.white04})`,
                          boxShadow: h.current ? `0 0 20px rgba(220,38,38,0.4)` : "none",
                          transition: "height 0.6s ease",
                        }} />
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: h.current ? 700 : 500,
                          color: h.current ? C.red : C.white30, letterSpacing: "0.04em",
                        }}>{h.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div style={{ borderRadius: 6, overflow: "auto", border: `1px solid ${C.white08}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.blackCard }}>
                    {["MONTH", "RATE", "TOTAL COSTS", "Δ FROM PRIOR"].map((h, i) => (
                      <th key={i} style={{
                        textAlign: i === 0 ? "left" : "right", padding: "12px 14px",
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700,
                        letterSpacing: "0.15em", color: C.white30, borderBottom: `1px solid ${C.white08}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...HISTORICAL_RATES, { month: "Apr '26 (NEW)", rate: trueHourlyRate, costs: totalCosts }]
                    .reverse().map((h, i, arr) => {
                      const prev = arr[i + 1];
                      const delta = prev ? ((h.rate - prev.rate) / prev.rate * 100) : 0;
                      const isCurrent = i === 0;
                      return (
                        <tr key={i} className="jrow" style={{
                          background: isCurrent ? C.redSubtle : i % 2 === 0 ? "transparent" : C.white02,
                        }}>
                          <td style={{ padding: "10px 14px", fontFamily: "'Barlow', sans-serif", fontSize: 14, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? C.red : C.white, borderBottom: `1px solid ${C.white04}` }}>{h.month}</td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: isCurrent ? C.red : C.white, borderBottom: `1px solid ${C.white04}` }}>{fmt(h.rate)}</td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.white50, borderBottom: `1px solid ${C.white04}` }}>{fmtD(h.costs)}</td>
                          <td style={{
                            padding: "10px 14px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
                            color: delta > 0 ? C.redBright : delta < 0 ? C.green : C.white30,
                            borderBottom: `1px solid ${C.white04}`,
                          }}>{prev ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%` : "—"}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════ DEPLOY / APPROVE ══════ */}
        {activeTab === "approve" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            {approved ? (
              <div style={{
                textAlign: "center", padding: "64px 28px",
                background: `linear-gradient(135deg, rgba(34,197,94,0.05), ${C.blackCard})`,
                borderRadius: 8, border: `1px solid rgba(34,197,94,0.15)`,
              }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.08em", color: C.green }}>RATE DEPLOYED</h2>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 15, color: C.white50, maxWidth: 480, margin: "12px auto 0" }}>
                  True Hourly Rate of {fmt(trueHourlyRate)} is now live across {pricebookImpact.length} Pricebook items effective {currentMonth} 1st.
                </p>
                <button className="jbtn" onClick={() => { setApproved(false); setAdjustMode(false); }} style={{
                  marginTop: 28, padding: "8px 24px", borderRadius: 4, border: `1px solid ${C.white08}`,
                  background: "transparent", color: C.white30, fontSize: 12, cursor: "pointer",
                  fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", transition: "all 0.2s",
                }}>RESET (DEV)</button>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: C.white, marginBottom: 4 }}>DEPLOYMENT APPROVAL</h2>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white30, marginBottom: 24 }}>Review and deploy the new rate for {currentMonth}</p>

                <div style={{
                  background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 8, padding: 28, marginBottom: 20,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.2em", color: C.white30 }}>NEW TRUE HOURLY RATE</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: C.red, lineHeight: 1 }}>{fmt(trueHourlyRate)}</div>
                  </div>

                  <div style={{ height: 1, background: C.white08, margin: "0 0 20px" }} />

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginBottom: 20 }}>
                    {[
                      { label: "PREVIOUS RATE", value: fmt(prevRate) },
                      { label: "CHANGE", value: `${rateDelta > 0 ? "+" : ""}${rateDelta.toFixed(1)}%`, color: rateDelta > 0 ? C.redBright : C.green },
                      { label: "BREAKEVEN", value: fmt(breakeven) },
                      { label: "PROFIT MARGIN", value: settings.profitMargin + "%" },
                      { label: "TOTAL COSTS", value: fmtD(totalCosts) },
                      { label: "BILLABLE HOURS", value: Math.round(billableHours).toString() },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30 }}>{s.label}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: s.color || C.white, marginTop: 2 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: 1, background: C.white08, margin: "0 0 20px" }} />

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
                    {[
                      { label: "PRICEBOOK ITEMS", value: pricebookImpact.length },
                      { label: "FLAGGED ITEMS", value: flaggedCount, color: flaggedCount > 0 ? C.amber : C.green },
                      { label: "AVG CHANGE", value: avgChange.toFixed(1) + "%" },
                      { label: "DATA ALERTS", value: dataAlerts.length, color: dataAlerts.length > 0 ? C.amber : C.green },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, fontWeight: 700, letterSpacing: "0.15em", color: C.white30 }}>{s.label}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: s.color || C.white, marginTop: 2 }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {bigSwing && (
                  <div style={{
                    display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 20px",
                    background: "rgba(245,158,11,0.06)", border: `1px solid rgba(245,158,11,0.2)`,
                    borderRadius: 6, marginBottom: 20,
                  }}>
                    <span style={{ fontSize: 24, lineHeight: 1 }}>⚠️</span>
                    <div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, fontWeight: 700, color: C.amber }}>Significant Rate Change Detected</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: C.white50, marginTop: 4 }}>
                        Rate changed by {Math.abs(rateDelta).toFixed(1)}% — exceeds the ±20% threshold. Secondary confirmation required before deployment.
                      </div>
                    </div>
                  </div>
                )}

                {showConfirm && (
                  <div style={{
                    background: C.blackCard, border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 6,
                    padding: 24, marginBottom: 20,
                  }}>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 15, color: C.white, marginBottom: 18 }}>
                      Deploying a <strong style={{ color: C.red }}>{Math.abs(rateDelta).toFixed(1)}%</strong> rate change across {pricebookImpact.length} Pricebook items. Confirm?
                    </p>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button className="jbtn" onClick={handleApprove} style={{ ...btnStyle(C.red, C.white) }}>CONFIRM DEPLOY</button>
                      <button className="jbtn" onClick={() => setShowConfirm(false)} style={{ ...btnStyle("transparent", C.white50, C.white08) }}>CANCEL</button>
                    </div>
                  </div>
                )}

                {showReject && (
                  <div style={{
                    background: C.blackCard, border: `1px solid ${C.white08}`, borderRadius: 6,
                    padding: 24, marginBottom: 20,
                  }}>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: C.white, marginBottom: 12 }}>Rejection reason (logged permanently):</p>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      placeholder="e.g., Insurance costs haven't been updated yet..."
                      style={{
                        width: "100%", minHeight: 80, padding: 14, border: `1px solid ${C.white08}`,
                        borderRadius: 4, background: C.white02, color: C.white, fontSize: 13,
                        fontFamily: "'Barlow', sans-serif", resize: "vertical", outline: "none",
                      }} />
                    <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                      <button className="jbtn" onClick={() => { setShowReject(false); setRejectReason(""); }} style={{ ...btnStyle("transparent", C.redBright, "rgba(220,38,38,0.2)") }}>CONFIRM REJECT</button>
                      <button className="jbtn" onClick={() => setShowReject(false)} style={{ ...btnStyle("transparent", C.white50, C.white08) }}>CANCEL</button>
                    </div>
                  </div>
                )}

                {!showConfirm && !showReject && (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button className="jbtn" onClick={handleApprove} style={{ ...btnStyle(C.red, C.white), padding: "16px 40px", fontSize: 15 }}>
                      ✅ APPROVE & DEPLOY
                    </button>
                    <button className="jbtn" onClick={() => { setAdjustMode(true); setActiveTab("costs"); }}
                      style={{ ...btnStyle("transparent", C.red, "rgba(220,38,38,0.2)"), padding: "16px 32px", fontSize: 15 }}>
                      ✏️ ADJUST & APPROVE
                    </button>
                    <button className="jbtn" onClick={() => setShowReject(true)}
                      style={{ ...btnStyle("transparent", C.white50, C.white08), padding: "16px 32px", fontSize: 15 }}>
                      ❌ REJECT
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 32px", borderTop: `1px solid ${C.white04}`, flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="data:image/png;base64,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" alt="JT" style={ { width: 26, height: 22, objectFit: "contain" } } />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize:12, color: C.white15, letterSpacing: "0.12em" }}>
            JT PLUMBING HEATING & AIR
          </span>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize:12, color: C.white08 }}>
          CoDB Rate Engine v1.0
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize:12, color: C.white08, letterSpacing: "0.1em" }}>POWERED BY</span>
          <img src="data:image/png;base64,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" alt="TS" style={{ width: 20, height: 20, borderRadius: 3 }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: C.white15 }}>
            TRADE<span style={{ color: C.red }}>SAVANT</span><span style={{ fontSize:12, color: C.white08 }}>.AI</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg, color, border) {
  return {
    padding: "12px 28px", borderRadius: 4, border: border ? `1px solid ${border}` : "none",
    background: bg, color: color, cursor: "pointer", fontSize: 13,
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
    letterSpacing: "0.12em", transition: "all 0.2s",
  };
}
