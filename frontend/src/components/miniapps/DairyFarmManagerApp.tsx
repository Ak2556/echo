'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import EditRecordModal from './EditRecordModal';
import ViewRecordModal from './ViewRecordModal';
import { translations } from './translations';

interface Cow {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  lactationPeriod: number;
  dailyMilkYield: number;
  healthStatus: 'healthy' | 'sick' | 'pregnant' | 'dry';
  lastCheckup: string;
  acquisitionDate: string;
  pregnancyStatus?: {
    isPregnant: boolean;
    dueDate?: string;
    currentDay?: number;
  };
  healthIssues?: string[];
  vaccinations?: {
    name: string;
    date: string;
    nextDue: string;
  }[];
  pedigree?: {
    sireId?: string;
    sireName?: string;
    sireBreed?: string;
    sireRegistrationNumber?: string;
    sireTattooNumber?: string;
    damId?: string;
    damName?: string;
    damBreed?: string;
    damRegistrationNumber?: string;
    damTattooNumber?: string;
    registrationNumber?: string;
    tattooNumber?: string;
    earTagNumber?: string;
    microchipId?: string;
    generation: number;
    breedingCertificate?: string;
    birthCertificate?: string;
  };
  breeding?: {
    totalCalves: number;
    lastCalvingDate?: string;
    breedingHistory: {
      date: string;
      method: 'natural' | 'AI' | 'ET';
      sireUsed: string;
      result: 'pregnant' | 'failed' | 'pending';
      calvingDate?: string;
      calfId?: string;
    }[];
  };
  geneticData?: {
    inbreedingCoefficient: number;
    estimatedBreedingValues: {
      milk: number;
      fat: number;
      protein: number;
      fertility: number;
      health: number;
    };
    genomicData?: {
      tested: boolean;
      testDate?: string;
      markers: string[];
    };
  };
}

interface BreedingRecord {
  id: string;
  cowId: string;
  sireId: string;
  breedingDate: string;
  method: 'natural' | 'AI' | 'ET';
  technicianName: string;
  semenBatch?: string;
  expectedCalvingDate: string;
  actualCalvingDate?: string;
  calvingResult: 'pending' | 'live_calf' | 'stillborn' | 'abortion' | 'twins';
  calfDetails?: {
    id: string;
    sex: 'male' | 'female';
    birthWeight: number;
    vigor: 'excellent' | 'good' | 'fair' | 'poor';
  }[];
  complications?: string[];
  notes?: string;
}

interface Sire {
  id: string;
  name: string;
  breed: string;
  registrationNumber: string;
  tattooNumber: string;
  earTagNumber: string;
  microchipId?: string;
  origin: string;
  birthDate: string;
  bloodlines: string[];
  damNumber: string;
  damName: string;
  damRegistrationNumber: string;
  sireNumber: string;
  sireName: string;
  sireRegistrationNumber: string;
  estimatedBreedingValues: {
    milk: number;
    fat: number;
    protein: number;
    fertility: number;
    health: number;
    longevity: number;
  };
  geneticLineage: {
    sire: string;
    sireRegNumber: string;
    dam: string;
    damRegNumber: string;
    grandsire: string;
    grandsireRegNumber: string;
    granddam: string;
    granddamRegNumber: string;
    maternalGrandsire: string;
    maternalGrandsireRegNumber: string;
    maternalGranddam: string;
    maternalGranddamRegNumber: string;
  };
  breedingCertificates: string[];
  genomicTestResults: {
    tested: boolean;
    testDate?: string;
    testLab?: string;
    geneticMarkers: string[];
    inbreedingCoefficient: number;
    genomicAccuracy: number;
  };
  progenyTested: boolean;
  progenyCount: number;
  activeStatus: 'active' | 'retired' | 'deceased';
  servicePrice: number;
  availableDoses: number;
  lastCollection: string;
}

interface BreedInfo {
  name: string;
  origin: string;
  imageUrl?: string;
  avgMilkYield: string;
  avgWeight: string;
  characteristics: string[];
  advantages: string[];
  suitableClimate: string;
  feedRequirements: string;
  calvingInterval: string;
  lifespan: string;
  diseases: string[];
  careNotes: string[];
  geneticLineage: {
    parentBreeds: string[];
    foundationAnimals: string[];
    geneticComposition: string;
    breedingHistory: string[];
    registrationBody: string;
    herdBook: string;
  };
  breedingData: {
    maturityAge: string;
    firstCalvingAge: string;
    calvingEase: string;
    birthWeight: string;
    ageAtFirstBreeding: string;
    gestationPeriod: string;
    lactationLength: string;
    dryPeriod: string;
    expectedCalves: number;
    twinningRate: string;
  };
  performanceData: {
    peakLactation: string;
    milkComposition: {
      fat: string;
      protein: string;
      lactose: string;
      solids: string;
    };
    feedEfficiency: string;
    reproductiveEfficiency: string;
    longevityIndex: string;
    adaptabilityScore: string;
  };
  historicalData: {
    developmentPeriod: string;
    keyBreeders: string[];
    milestones: string[];
    populationTrends: string;
    conservationStatus: string;
  };
}

interface Problem {
  id: string;
  category: 'health' | 'feeding' | 'breeding' | 'milk' | 'management';
  title: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
  prevention: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine';
}

interface MilkRecord {
  id: string;
  cowId: string;
  date: string;
  morningYield: number;
  eveningYield: number;
  quality: 'excellent' | 'good' | 'average' | 'poor';
  fatContent: number;
}

interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface CattleRecord {
  id: string;
  breed: string;
  tagNo: string;
  birthDate: string;
  motherCode: string;
  fatherName: string;
  lactation: number;
  aiLastCheckup: string;
  heatCycle: string;
  deworming: string;
  semenDetail: string;
}

interface DairyFarmManagerAppProps {
  isVisible: boolean;
  onClose: () => void;
}

// New interfaces for enhanced features
interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  date: string;
  conditions: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
}

interface FeedSchedule {
  id: string;
  cowId: string;
  feedType: string;
  amount: number;
  time: string;
  date: string;
  completed: boolean;
}

interface Alert {
  id: string;
  type: 'health' | 'breeding' | 'feeding' | 'milking' | 'vaccination';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  acknowledged: boolean;
  cowId?: string;
}

interface PerformanceMetrics {
  date: string;
  totalMilkYield: number;
  averageFatContent: number;
  feedEfficiency: number;
  healthScore: number;
  breedingSuccessRate: number;
}

interface CattleVideo {
  id: string;
  title: string;
  description: string;
  uploadedBy: string;
  uploadDate: string;
  category: 'training' | 'health' | 'breeding' | 'feeding' | 'general';
  thumbnailUrl?: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
}

export default function DairyFarmManagerApp({
  isVisible,
  onClose,
}: DairyFarmManagerAppProps) {
  // Early return if not visible
  if (!isVisible) {
    return null;
  }

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'cows'
    | 'records'
    | 'health'
    | 'videos'
  >('dashboard');
  const [language, setLanguage] = useState<'english' | 'punjabi'>('english');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [selectedBreed, setSelectedBreed] = useState<BreedInfo | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CattleRecord | null>(null);
  const [addForm, setAddForm] = useState<Partial<CattleRecord>>({});
  const addModalFirstRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (showModal === 'addRecord') {
      // focus the first input/select in the add modal when it opens
      setTimeout(() => addModalFirstRef.current?.focus(), 0);
    }
  }, [showModal]);

  const updateCattleRecord = useCallback((id: string, updates: Partial<CattleRecord>) => {
    setCattleRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteCattleRecord = useCallback((id: string) => {
    setCattleRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedRecord((prev) => (prev && prev.id === id ? null : prev));
    setShowModal((prev) => (prev === 'viewRecord' || prev === 'editRecord' ? null : prev));
  }, []);

  // Enhanced state management
  const [weatherData, setWeatherData] = useState<WeatherData[]>([
    {
      temperature: 28,
      humidity: 65,
      rainfall: 0,
      windSpeed: 12,
      date: '2024-01-25',
      conditions: 'sunny',
    },
    {
      temperature: 26,
      humidity: 70,
      rainfall: 5,
      windSpeed: 8,
      date: '2024-01-24',
      conditions: 'rainy',
    },
  ]);

  const [feedSchedules, setFeedSchedules] = useState<FeedSchedule[]>([
    {
      id: 'FS001',
      cowId: '1',
      feedType: 'Concentrate',
      amount: 3,
      time: '06:00',
      date: '2024-01-25',
      completed: true,
    },
    {
      id: 'FS002',
      cowId: '2',
      feedType: 'Hay',
      amount: 5,
      time: '18:00',
      date: '2024-01-25',
      completed: false,
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'A001',
      type: 'vaccination',
      title: 'Vaccination Due',
      message: 'Ganga is due for FMD vaccination in 3 days',
      priority: 'medium',
      date: '2024-01-25',
      acknowledged: false,
      cowId: '1',
    },
    {
      id: 'A002',
      type: 'breeding',
      title: 'Heat Detection',
      message: 'Lakshmi showing signs of heat - consider breeding',
      priority: 'high',
      date: '2024-01-25',
      acknowledged: false,
      cowId: '3',
    },
    {
      id: 'A003',
      type: 'health',
      title: 'Health Checkup',
      message: 'Nandini needs routine health checkup',
      priority: 'low',
      date: '2024-01-25',
      acknowledged: true,
      cowId: '4',
    },
  ]);

  // State for managing records
  const [cattleRecords, setCattleRecords] = useState<CattleRecord[]>([
    {
      id: 'CR001',
      breed: 'Gir',
      tagNo: '001-GIR-2022',
      birthDate: '2022-03-10',
      motherCode: 'GIR-DAM-015',
      fatherName: 'Gir Elite-1',
      lactation: 2,
      aiLastCheckup: '2024-01-15',
      heatCycle: 'Regular - 21 days',
      deworming: '2023-12-01',
      semenDetail: 'GIR-ELITE-001 (Batch: GE-2024-01)',
    },
    {
      id: 'CR002',
      breed: 'Sahiwal',
      tagNo: '002-SAH-2019',
      birthDate: '2019-08-15',
      motherCode: 'SAH-QUEEN-012',
      fatherName: 'Sahiwal Champion',
      lactation: 4,
      aiLastCheckup: '2024-01-20',
      heatCycle: 'Pregnant - Due 2024-04-15',
      deworming: '2023-11-15',
      semenDetail: 'SAH-ELITE-X (Batch: SE-2023-07)',
    },
    {
      id: 'CR003',
      breed: 'Holstein Friesian',
      tagNo: '003-HF-2023',
      birthDate: '2023-01-20',
      motherCode: 'HF-ELITE-025',
      fatherName: 'Holstein Supreme',
      lactation: 1,
      aiLastCheckup: '2024-01-18',
      heatCycle: 'Regular - 19 days',
      deworming: '2023-12-20',
      semenDetail: 'HF-SUPREME-003 (Batch: HS-2023-11)',
    },
    {
      id: 'CR004',
      breed: 'Jersey',
      tagNo: '004-JER-2020',
      birthDate: '2020-05-12',
      motherCode: 'JER-PRIN-030',
      fatherName: 'Jersey Champion',
      lactation: 5,
      aiLastCheckup: '2024-01-10',
      heatCycle: 'Dry period',
      deworming: '2023-10-25',
      semenDetail: 'JER-ELITE-Z (Batch: JE-2022-06)',
    },
    {
      id: 'CR005',
      breed: 'Red Sindhi',
      tagNo: '005-RS-2021',
      birthDate: '2021-11-08',
      motherCode: 'RS-MOTHER-008',
      fatherName: 'Red Sindhi Elite',
      lactation: 2,
      aiLastCheckup: '2024-01-12',
      heatCycle: 'Regular - 20 days',
      deworming: '2023-11-30',
      semenDetail: 'RS-ELITE-001 (Batch: RE-2023-12)',
    },
    {
      id: 'CR006',
      breed: 'Tharparkar',
      tagNo: '006-TH-2022',
      birthDate: '2022-07-22',
      motherCode: 'TH-DESERT-012',
      fatherName: 'Tharparkar King',
      lactation: 1,
      aiLastCheckup: '2024-01-08',
      heatCycle: 'Regular - 22 days',
      deworming: '2023-12-15',
      semenDetail: 'TH-KING-001 (Batch: TK-2023-10)',
    },
  ]);

  // Videos state
  const [cattleVideos, setCattleVideos] = useState<CattleVideo[]>([
    {
      id: 'V001',
      title: 'Proper Milking Technique for Holstein',
      description: 'Learn the correct way to milk cattle for maximum yield and hygiene',
      uploadedBy: 'Farm Expert Punjab',
      uploadDate: '2024-01-20',
      category: 'training',
      videoUrl: '#',
      duration: '12:35',
      views: 1250,
      likes: 89,
    },
    {
      id: 'V002',
      title: 'Identifying Heat Signs in Sahiwal Cattle',
      description: 'Essential guide to recognize breeding readiness in desi breeds',
      uploadedBy: 'Vet Dr. Singh',
      uploadDate: '2024-01-18',
      category: 'breeding',
      videoUrl: '#',
      duration: '8:42',
      views: 980,
      likes: 67,
    },
    {
      id: 'V003',
      title: 'Common Health Issues in Dairy Cattle',
      description: 'Prevention and treatment of mastitis, fever, and digestive problems',
      uploadedBy: 'Dr. Kaur Veterinary',
      uploadDate: '2024-01-15',
      category: 'health',
      videoUrl: '#',
      duration: '15:20',
      views: 1580,
      likes: 125,
    },
  ]);

  const t = translations[language];

  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetrics[]
  >([
    {
      date: '2024-01-25',
      totalMilkYield: 70,
      averageFatContent: 4.2,
      feedEfficiency: 0.75,
      healthScore: 92,
      breedingSuccessRate: 85,
    },
    {
      date: '2024-01-24',
      totalMilkYield: 68,
      averageFatContent: 4.1,
      feedEfficiency: 0.73,
      healthScore: 90,
      breedingSuccessRate: 85,
    },
    {
      date: '2024-01-23',
      totalMilkYield: 72,
      averageFatContent: 4.3,
      feedEfficiency: 0.77,
      healthScore: 94,
      breedingSuccessRate: 85,
    },
  ]);

  // Comprehensive Breed Database
  const breedDatabase: BreedInfo[] = [
    {
      name: 'Gir',
      origin: 'Gujarat, India',
      imageUrl:
        'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop&crop=faces',
      avgMilkYield: '1,590 kg/lactation (305 days)',
      avgWeight: '385 kg (female), 545 kg (male)',
      characteristics: [
        'Distinctive lyre-shaped horns',
        'Pendulous ears',
        'Prominent forehead',
        'White/red spotted coat',
      ],
      advantages: [
        'Heat tolerant',
        'Disease resistant',
        'High butterfat content',
        'Good mothering ability',
      ],
      suitableClimate: 'Hot arid to semi-arid tropical',
      feedRequirements: '2.5-3% of body weight daily, high fiber diet',
      calvingInterval: '400-450 days',
      lifespan: '12-15 years',
      diseases: ['Foot and mouth disease', 'Mastitis', 'Heat stress'],
      careNotes: [
        'Provide adequate shade',
        'Regular hoof trimming',
        'Monitor for heat stress',
      ],
      geneticLineage: {
        parentBreeds: ['Indigenous Bos indicus'],
        foundationAnimals: [
          'Gir foundation herd from Gir forests',
          'Saurashtra native cattle',
          'Kathiawar peninsula stock',
        ],
        geneticComposition: '100% Pure Zebu (Bos indicus)',
        breedingHistory: [
          '3000 BC - Original domestication in Indus Valley',
          '1000 BC - Selective breeding in Gir forests',
          '1875 - First breed registry established',
          '1950 - Breed improvement programs initiated',
          '1970 - AI programs established',
          '2000 - Genomic selection programs started',
        ],
        registrationBody: 'All India Cattle and Buffalo Breeding Association',
        herdBook: 'Gir Cattle Herd Book Society, Gujarat',
      },
      breedingData: {
        maturityAge: '18-24 months',
        firstCalvingAge: '30-36 months',
        calvingEase: 'Excellent (95% unassisted)',
        birthWeight: '22-28 kg',
        ageAtFirstBreeding: '15-18 months',
        gestationPeriod: '285-290 days',
        lactationLength: '280-305 days',
        dryPeriod: '60-75 days',
        expectedCalves: 8,
        twinningRate: '0.8%',
      },
      performanceData: {
        peakLactation: '45-60 days post-calving',
        milkComposition: {
          fat: '4.5-5.2%',
          protein: '3.4-3.8%',
          lactose: '4.7-4.9%',
          solids: '13.2-14.1%',
        },
        feedEfficiency: '0.72 kg milk/kg feed',
        reproductiveEfficiency: '85%',
        longevityIndex: '8.5/10',
        adaptabilityScore: '9.2/10',
      },
      historicalData: {
        developmentPeriod: '3000 BC to present',
        keyBreeders: [
          'Gir Gaushala Trust',
          'Gujarat Animal Husbandry Dept',
          'NDDB Research Centers',
        ],
        milestones: [
          '1875 - First systematic breeding program',
          '1960 - Gir breed improvement project',
          '1995 - Embryo transfer technology adoption',
          '2010 - Genomic evaluation program',
        ],
        populationTrends: 'Stable population of ~1.2 million globally',
        conservationStatus: 'Least Concern - Well maintained',
      },
    },
    {
      name: 'Sahiwal',
      origin: 'Punjab, Pakistan/India',
      imageUrl:
        'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400&h=300&fit=crop&crop=center',
      avgMilkYield: '2,270 kg/lactation',
      avgWeight: '400 kg (female), 500 kg (male)',
      characteristics: [
        'Light to medium brown coat',
        'Loose skin',
        'Large dewlap',
        'Medium-sized drooping ears',
      ],
      advantages: [
        'High milk yield',
        'Heat tolerant',
        'Calm temperament',
        'Good feed conversion',
      ],
      suitableClimate: 'Hot semi-arid tropical',
      feedRequirements: '3-3.5% of body weight daily, balanced concentrate',
      calvingInterval: '390-420 days',
      lifespan: '15-18 years',
      diseases: [
        'Tick-borne diseases',
        'Reproductive disorders',
        'Metabolic disorders',
      ],
      careNotes: [
        'Regular tick control',
        'Balanced nutrition during pregnancy',
        'Clean milking practices',
      ],
      geneticLineage: {
        parentBreeds: ['Montgomery cattle', 'Multani cattle', 'Lohani cattle'],
        foundationAnimals: [
          'Sahiwal district foundation herds',
          'Montgomery breeding bulls',
          'Elite Multani females',
        ],
        geneticComposition: '100% Pure Zebu with regional adaptations',
        breedingHistory: [
          '1800s - Development in Sahiwal district',
          '1914 - First exports to Australia',
          '1930 - Breed society established',
          '1947 - Partition led to breed splitting',
          '1960 - Pakistan breed improvement program',
          '1980 - India Sahiwal conservation program',
        ],
        registrationBody:
          'Pakistan Livestock Commission & Indian Council of Agricultural Research',
        herdBook: 'Sahiwal Cattle Breeders Association',
      },
      breedingData: {
        maturityAge: '20-24 months',
        firstCalvingAge: '32-38 months',
        calvingEase: 'Good (90% unassisted)',
        birthWeight: '24-30 kg',
        ageAtFirstBreeding: '16-20 months',
        gestationPeriod: '280-285 days',
        lactationLength: '300-320 days',
        dryPeriod: '45-60 days',
        expectedCalves: 9,
        twinningRate: '1.2%',
      },
      performanceData: {
        peakLactation: '40-55 days post-calving',
        milkComposition: {
          fat: '4.8-5.4%',
          protein: '3.2-3.6%',
          lactose: '4.6-4.8%',
          solids: '13.0-13.8%',
        },
        feedEfficiency: '0.78 kg milk/kg feed',
        reproductiveEfficiency: '88%',
        longevityIndex: '9.0/10',
        adaptabilityScore: '9.5/10',
      },
      historicalData: {
        developmentPeriod: '1800s to present',
        keyBreeders: [
          'Sahiwal District Breeders',
          'Government Cattle Farms',
          'Private Elite Herds',
        ],
        milestones: [
          '1914 - First international recognition',
          '1947 - Cross-border breed conservation',
          '1975 - Frozen semen technology',
          '2005 - Genetic diversity studies',
        ],
        populationTrends: 'Declining in origin, stable in other regions',
        conservationStatus: 'Watch List - Conservation needed',
      },
    },
    {
      name: 'Red Sindhi',
      origin: 'Sindh Province, Pakistan',
      imageUrl:
        'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop&crop=center',
      avgMilkYield: '1,800 kg/lactation',
      avgWeight: '340 kg (female), 400 kg (male)',
      characteristics: [
        'Red coat color',
        'White patches on face and legs',
        'Medium-sized compact body',
        'Hardy constitution',
      ],
      advantages: [
        'Highly adaptable',
        'Disease resistant',
        'Good grazing ability',
        'Dual purpose',
      ],
      suitableClimate: 'Hot arid to tropical',
      feedRequirements: '2.5-3% of body weight, drought-resistant feed',
      calvingInterval: '420-450 days',
      lifespan: '14-16 years',
      diseases: [
        'Parasitic infections',
        'Nutritional deficiencies',
        'Heat stroke',
      ],
      careNotes: [
        'Supplemental feeding during dry season',
        'Parasite prevention',
        'Water availability',
      ],
      geneticLineage: {
        parentBreeds: [
          'Sindhi local cattle',
          'Kankrej influence',
          'Tharparkar admixture',
        ],
        foundationAnimals: [
          'Sindhi red cattle herds',
          'Las Bela breeding stock',
          'Karachi port cattle',
        ],
        geneticComposition: '95% Sindhi zebu, 5% other regional breeds',
        breedingHistory: [
          '1700s - Development in Sindh province',
          '1909 - First systematic selection',
          '1920 - Breed characterization studies',
          '1950 - Conservation programs initiated',
          '1990 - Crossbreeding programs',
          '2010 - Genetic diversity preservation',
        ],
        registrationBody: 'Sindhi Cattle Breeders Society',
        herdBook: 'Red Sindhi Herd Registry',
      },
      breedingData: {
        maturityAge: '18-22 months',
        firstCalvingAge: '34-40 months',
        calvingEase: 'Excellent (93% unassisted)',
        birthWeight: '20-26 kg',
        ageAtFirstBreeding: '16-18 months',
        gestationPeriod: '285-295 days',
        lactationLength: '275-300 days',
        dryPeriod: '65-80 days',
        expectedCalves: 7,
        twinningRate: '0.6%',
      },
      performanceData: {
        peakLactation: '50-65 days post-calving',
        milkComposition: {
          fat: '4.2-4.8%',
          protein: '3.3-3.7%',
          lactose: '4.8-5.0%',
          solids: '12.8-13.5%',
        },
        feedEfficiency: '0.68 kg milk/kg feed',
        reproductiveEfficiency: '82%',
        longevityIndex: '8.2/10',
        adaptabilityScore: '9.8/10',
      },
      historicalData: {
        developmentPeriod: '1700s to present',
        keyBreeders: [
          'Sindhi Zamindars',
          'Government Livestock Farms',
          'Rural Communities',
        ],
        milestones: [
          '1909 - First breed survey',
          '1947 - Post-partition conservation',
          '1985 - International breed recognition',
          '2000 - DNA fingerprinting studies',
        ],
        populationTrends: 'Critically low in origin, maintained elsewhere',
        conservationStatus: 'Critical - Urgent conservation needed',
      },
    },
    {
      name: 'Tharparkar',
      origin: 'Thar Desert, Rajasthan',
      avgMilkYield: '1,950 kg/lactation',
      avgWeight: '400 kg (female), 500 kg (male)',
      characteristics: [
        'White or light grey coat',
        'Medium to large size',
        'Long face',
        'Well-developed udder',
      ],
      advantages: [
        'Drought tolerant',
        'High milk fat',
        'Dual purpose',
        'Hardy nature',
      ],
      suitableClimate: 'Arid and semi-arid',
      feedRequirements: '2-2.5% of body weight, low-quality roughage tolerance',
      calvingInterval: '450-480 days',
      lifespan: '12-14 years',
      diseases: [
        'Nutritional disorders',
        'Reproductive problems',
        'Eye infections',
      ],
      careNotes: [
        'Mineral supplementation',
        'Eye protection from sand',
        'Dry season management',
      ],
      geneticLineage: {
        parentBreeds: [
          'Thar desert native cattle',
          'Kankrej influence',
          'Local Rajasthani breeds',
        ],
        foundationAnimals: [
          'Thar desert foundation herds',
          'Barmer district stock',
          'Jodhpur breeding lines',
        ],
        geneticComposition: '100% Desert-adapted Zebu',
        breedingHistory: [
          '1000 AD - Desert adaptation began',
          '1600s - Rajput breeding programs',
          '1920 - British colonial documentation',
          '1960 - Independent India breed development',
          '1985 - Drought resistance studies',
          '2005 - Climate resilience research',
        ],
        registrationBody: 'Rajasthan Livestock Development Board',
        herdBook: 'Tharparkar Cattle Registry',
      },
      breedingData: {
        maturityAge: '20-26 months',
        firstCalvingAge: '36-42 months',
        calvingEase: 'Good (88% unassisted)',
        birthWeight: '18-24 kg',
        ageAtFirstBreeding: '18-22 months',
        gestationPeriod: '290-300 days',
        lactationLength: '260-285 days',
        dryPeriod: '80-100 days',
        expectedCalves: 6,
        twinningRate: '0.4%',
      },
      performanceData: {
        peakLactation: '55-70 days post-calving',
        milkComposition: {
          fat: '4.6-5.3%',
          protein: '3.5-3.9%',
          lactose: '4.5-4.7%',
          solids: '13.5-14.2%',
        },
        feedEfficiency: '0.65 kg milk/kg feed',
        reproductiveEfficiency: '78%',
        longevityIndex: '7.8/10',
        adaptabilityScore: '10.0/10',
      },
      historicalData: {
        developmentPeriod: '1000 AD to present',
        keyBreeders: [
          'Rajasthani Herders',
          'Desert Communities',
          'Government Research Stations',
        ],
        milestones: [
          '1920 - First scientific documentation',
          '1965 - Drought tolerance studies',
          '1990 - Desert ecosystem integration',
          '2010 - Climate change adaptation research',
        ],
        populationTrends:
          'Stable in desert regions, expanding to similar climates',
        conservationStatus: 'Secure - Well adapted population',
      },
    },
    {
      name: 'Holstein Friesian',
      origin: 'Netherlands/Germany',
      avgMilkYield: '6,500-9,000 kg/lactation',
      avgWeight: '580 kg (female), 900 kg (male)',
      characteristics: [
        'Black and white patches',
        'Large frame',
        'Well-developed udder',
        'High milk production',
      ],
      advantages: [
        'Highest milk yield',
        'Good feed conversion',
        'Early maturity',
        'Long lactation',
      ],
      suitableClimate: 'Temperate to subtropical with cooling',
      feedRequirements: '3.5-4% of body weight, high-quality concentrates',
      calvingInterval: '365-400 days',
      lifespan: '6-8 years in intensive systems',
      diseases: ['Mastitis', 'Lameness', 'Metabolic disorders', 'Heat stress'],
      careNotes: [
        'Climate control essential',
        'High-quality nutrition',
        'Regular health monitoring',
      ],
      geneticLineage: {
        parentBreeds: [
          'Friesian (Netherlands)',
          'Holstein (Germany)',
          'Danish Black Pied',
        ],
        foundationAnimals: [
          'Netherlands Friesian bulls',
          'German Holstein foundation',
          'North American imports',
        ],
        geneticComposition: '100% European Bos taurus dairy breeds',
        breedingHistory: [
          '1600s - Development in Netherlands/Germany',
          '1852 - First imports to North America',
          '1885 - Holstein Friesian Association formed',
          '1940 - Artificial insemination programs',
          '1970 - International genetic exchange',
          '1990 - Genomic selection revolution',
        ],
        registrationBody: 'Holstein International & National Associations',
        herdBook: 'World Holstein Friesian Federation',
      },
      breedingData: {
        maturityAge: '12-15 months',
        firstCalvingAge: '22-26 months',
        calvingEase: 'Moderate (75% unassisted)',
        birthWeight: '38-45 kg',
        ageAtFirstBreeding: '13-16 months',
        gestationPeriod: '278-285 days',
        lactationLength: '305-365 days',
        dryPeriod: '45-65 days',
        expectedCalves: 12,
        twinningRate: '4.2%',
      },
      performanceData: {
        peakLactation: '35-50 days post-calving',
        milkComposition: {
          fat: '3.4-3.8%',
          protein: '3.1-3.4%',
          lactose: '4.8-5.1%',
          solids: '12.0-12.8%',
        },
        feedEfficiency: '1.35 kg milk/kg feed',
        reproductiveEfficiency: '92%',
        longevityIndex: '6.5/10',
        adaptabilityScore: '4.5/10',
      },
      historicalData: {
        developmentPeriod: '1600s to present',
        keyBreeders: [
          'European Dairy Cooperatives',
          'North American Breeders',
          'Global AI Companies',
        ],
        milestones: [
          '1885 - Breed association formation',
          '1940 - AI technology adoption',
          '1970 - Performance recording systems',
          '2008 - Genomic revolution',
          '2020 - Precision breeding programs',
        ],
        populationTrends: 'Largest dairy breed globally - 50+ million',
        conservationStatus: 'Secure - Dominant global breed',
      },
    },
    {
      name: 'Jersey',
      origin: 'Jersey Island, UK',
      avgMilkYield: '4,500-5,500 kg/lactation',
      avgWeight: '400 kg (female), 600 kg (male)',
      characteristics: [
        'Light brown to fawn color',
        'Small to medium size',
        'Dished face',
        'Large eyes',
      ],
      advantages: [
        'High butterfat content',
        'Efficient feed converter',
        'Hardy',
        'Easy calving',
      ],
      suitableClimate: 'Moderate tropical to subtropical',
      feedRequirements: '3-3.5% of body weight, quality concentrates',
      calvingInterval: '380-410 days',
      lifespan: '10-12 years',
      diseases: ['Milk fever', 'Ketosis', 'Displaced abomasum'],
      careNotes: [
        'Monitor for metabolic diseases',
        'Calcium supplementation',
        'Body condition scoring',
      ],
      geneticLineage: {
        parentBreeds: [
          'Norman cattle',
          'Breton cattle',
          'Island native breeds',
        ],
        foundationAnimals: [
          'Jersey Island foundation herds',
          'Le Maître bloodlines',
          'Oxford bloodlines',
        ],
        geneticComposition: '100% Channel Island dairy breed',
        breedingHistory: [
          '1700s - Island isolation breeding',
          '1789 - Import ban to maintain purity',
          '1866 - First herd book established',
          '1900 - Global exports began',
          '1960 - Type classification systems',
          '2000 - Genomic programs initiated',
        ],
        registrationBody:
          'Jersey Cattle Society & American Jersey Cattle Association',
        herdBook: 'Jersey Herd Book Society',
      },
      breedingData: {
        maturityAge: '14-18 months',
        firstCalvingAge: '22-28 months',
        calvingEase: 'Excellent (95% unassisted)',
        birthWeight: '22-28 kg',
        ageAtFirstBreeding: '14-17 months',
        gestationPeriod: '277-284 days',
        lactationLength: '300-330 days',
        dryPeriod: '50-70 days',
        expectedCalves: 10,
        twinningRate: '2.8%',
      },
      performanceData: {
        peakLactation: '40-55 days post-calving',
        milkComposition: {
          fat: '4.8-5.5%',
          protein: '3.6-4.0%',
          lactose: '4.7-4.9%',
          solids: '13.8-14.8%',
        },
        feedEfficiency: '1.15 kg milk/kg feed',
        reproductiveEfficiency: '94%',
        longevityIndex: '8.8/10',
        adaptabilityScore: '7.5/10',
      },
      historicalData: {
        developmentPeriod: '1700s to present',
        keyBreeders: [
          'Jersey Island Farmers',
          'Global Jersey Associations',
          'Elite Breeding Programs',
        ],
        milestones: [
          '1789 - Purity protection laws',
          '1866 - First official herd book',
          '1920 - International breed expansion',
          '1980 - Linear type evaluation',
          '2010 - Genomic selection programs',
        ],
        populationTrends: 'Second largest dairy breed globally - 8+ million',
        conservationStatus: 'Secure - Strong global presence',
      },
    },
  ];

  // Comprehensive Problem Database
  const problemDatabase: Problem[] = [
    {
      id: 'mastitis',
      category: 'health',
      title: 'Mastitis (Udder Infection)',
      symptoms: [
        'Swollen udder',
        'Hot udder quarters',
        'Clotted milk',
        'Reduced milk yield',
        'Fever',
        'Loss of appetite',
      ],
      causes: [
        'Poor milking hygiene',
        'Bacterial infection',
        'Teat injuries',
        'Overcrowding',
        'Stress',
      ],
      solutions: [
        'Immediate antibiotic treatment as per vet advice',
        'Frequent milking of affected quarter',
        'Hot water fomentation',
        'Proper udder cleaning',
        'Isolate affected animal',
      ],
      prevention: [
        'Pre and post milking teat dipping',
        'Clean milking environment',
        'Regular udder examination',
        'Proper milking technique',
        'Dry cow therapy',
      ],
      severity: 'high',
      urgency: 'immediate',
    },
    {
      id: 'heat_stress',
      category: 'management',
      title: 'Heat Stress',
      symptoms: [
        'Excessive panting',
        'Drooling',
        'Reduced feed intake',
        'Drop in milk production',
        'Lethargy',
        'High body temperature',
      ],
      causes: [
        'High ambient temperature',
        'High humidity',
        'Lack of shade',
        'Poor ventilation',
        'Overcrowding',
      ],
      solutions: [
        'Provide immediate shade and ventilation',
        'Cold water spraying',
        'Electrolyte supplementation',
        'Reduce stocking density',
        'Adjust feeding times to cooler hours',
      ],
      prevention: [
        'Install proper shade structures',
        'Use fans and misters',
        'Provide constant cool water access',
        'Adjust feeding schedule',
        'Plant trees for natural shade',
      ],
      severity: 'high',
      urgency: 'immediate',
    },
    {
      id: 'foot_rot',
      category: 'health',
      title: 'Foot Rot',
      symptoms: [
        'Lameness',
        'Swelling between toes',
        'Foul smell',
        'Black discharge',
        'Reluctance to walk',
      ],
      causes: [
        'Wet muddy conditions',
        'Poor hoof hygiene',
        'Bacterial infection',
        'Injuries',
        'Nutritional deficiency',
      ],
      solutions: [
        'Clean and trim affected hooves',
        'Topical antibiotic application',
        'Footbath with copper sulfate',
        'Keep animal in dry area',
        'Pain management if severe',
      ],
      prevention: [
        'Regular hoof trimming',
        'Maintain dry flooring',
        'Weekly footbaths',
        'Proper nutrition with zinc/copper',
        'Regular hoof inspection',
      ],
      severity: 'medium',
      urgency: 'within_24h',
    },
    {
      id: 'low_milk_yield',
      category: 'milk',
      title: 'Sudden Drop in Milk Production',
      symptoms: [
        'Reduced daily milk yield',
        'Change in milk consistency',
        'Animal appears healthy otherwise',
      ],
      causes: [
        'Stress',
        'Poor nutrition',
        'Disease',
        'Pregnancy',
        'Change in routine',
        'Heat stress',
      ],
      solutions: [
        'Check for signs of illness',
        'Review and improve feed quality',
        'Ensure adequate water supply',
        'Reduce stress factors',
        'Pregnancy testing',
        'Veterinary examination',
      ],
      prevention: [
        'Consistent feeding schedule',
        'Balanced nutrition program',
        'Stress reduction measures',
        'Regular health checks',
        'Proper breeding records',
      ],
      severity: 'medium',
      urgency: 'within_week',
    },
    {
      id: 'reproductive_failure',
      category: 'breeding',
      title: 'Repeat Breeding/Conception Failure',
      symptoms: [
        'Multiple failed AI attempts',
        'Irregular heat cycles',
        'Silent heat',
        'Poor conception rates',
      ],
      causes: [
        'Nutritional deficiency',
        'Uterine infection',
        'Hormonal imbalance',
        'Poor AI technique',
        'Genetic factors',
      ],
      solutions: [
        'Veterinary reproductive examination',
        'Hormone therapy if recommended',
        'Improve body condition scoring',
        'Better heat detection methods',
        'Quality semen and proper AI timing',
      ],
      prevention: [
        'Balanced nutrition with vitamins A, D, E',
        'Proper body condition maintenance',
        'Regular reproductive health checks',
        'Skilled AI technician',
        'Record keeping for heat cycles',
      ],
      severity: 'medium',
      urgency: 'within_week',
    },
    {
      id: 'feed_shortage',
      category: 'feeding',
      title: 'Feed Shortage/Poor Quality Feed',
      symptoms: [
        'Reduced feed intake',
        'Weight loss',
        'Decreased milk production',
        'Poor body condition',
        'Nutritional deficiencies',
      ],
      causes: [
        'Drought',
        'Poor crop planning',
        'Storage issues',
        'Economic constraints',
        'Market unavailability',
      ],
      solutions: [
        'Source alternative feed materials',
        'Implement rationing strategies',
        'Use feed additives to improve quality',
        'Cull low-producing animals',
        'Seek government/NGO support',
      ],
      prevention: [
        'Advance feed planning and procurement',
        'Diversify feed sources',
        'Proper feed storage facilities',
        'Maintain feed reserves',
        'Insurance for crop failure',
      ],
      severity: 'high',
      urgency: 'within_24h',
    },
  ];

  const [cows, setCows] = useState<Cow[]>([
    {
      id: '1',
      name: 'Ganga',
      breed: 'Gir',
      age: 4,
      weight: 385,
      lactationPeriod: 280,
      dailyMilkYield: 12,
      healthStatus: 'healthy',
      lastCheckup: '2024-01-15',
      acquisitionDate: '2022-03-10',
      pregnancyStatus: { isPregnant: false },
      healthIssues: [],
      vaccinations: [
        { name: 'FMD', date: '2024-01-10', nextDue: '2024-07-10' },
        { name: 'HS', date: '2023-12-05', nextDue: '2024-12-05' },
      ],
      pedigree: {
        sireId: 'SIRE001',
        sireName: 'Gir Elite-1',
        sireBreed: 'Gir',
        sireRegistrationNumber: 'GIR-ELITE-001',
        sireTattooNumber: 'GE1-2019',
        damId: 'COW015',
        damName: 'Ganga Mother',
        damBreed: 'Gir',
        damRegistrationNumber: 'GIR-DAM-015',
        damTattooNumber: 'GM-2018',
        registrationNumber: 'GIR-2022-001',
        tattooNumber: 'GNG-2022',
        earTagNumber: '001-GIR-2022',
        microchipId: '982000123456789',
        generation: 3,
        breedingCertificate: 'BC-GIR-2022-001',
        birthCertificate: 'BIRTH-GIR-2022-001',
      },
      breeding: {
        totalCalves: 2,
        lastCalvingDate: '2023-05-15',
        breedingHistory: [
          {
            date: '2022-08-10',
            method: 'AI',
            sireUsed: 'Gir Elite-2',
            result: 'pregnant',
            calvingDate: '2023-05-15',
            calfId: 'CALF001',
          },
        ],
      },
      geneticData: {
        inbreedingCoefficient: 0.02,
        estimatedBreedingValues: {
          milk: 105,
          fat: 108,
          protein: 102,
          fertility: 103,
          health: 107,
        },
        genomicData: {
          tested: true,
          testDate: '2022-04-01',
          markers: ['A1A2', 'BB', 'POLLED'],
        },
      },
    },
    {
      id: '2',
      name: 'Kamdhenu',
      breed: 'Sahiwal',
      age: 5,
      weight: 420,
      lactationPeriod: 305,
      dailyMilkYield: 18,
      healthStatus: 'pregnant',
      lastCheckup: '2024-01-20',
      acquisitionDate: '2021-08-15',
      pregnancyStatus: {
        isPregnant: true,
        dueDate: '2024-04-15',
        currentDay: 245,
      },
      healthIssues: [],
      vaccinations: [
        { name: 'FMD', date: '2024-01-12', nextDue: '2024-07-12' },
        { name: 'BQ', date: '2023-11-20', nextDue: '2024-11-20' },
      ],
      pedigree: {
        sireId: 'SIRE002',
        sireName: 'Sahiwal Champion',
        sireBreed: 'Sahiwal',
        sireRegistrationNumber: 'SAH-CHAMP-002',
        sireTattooNumber: 'SC-2017',
        damId: 'COW012',
        damName: 'Sahiwal Queen',
        damBreed: 'Sahiwal',
        damRegistrationNumber: 'SAH-QUEEN-012',
        damTattooNumber: 'SQ-2016',
        registrationNumber: 'SAH-2019-045',
        tattooNumber: 'KMD-2019',
        earTagNumber: '002-SAH-2019',
        microchipId: '982000987654321',
        generation: 4,
        breedingCertificate: 'BC-SAH-2019-045',
        birthCertificate: 'BIRTH-SAH-2019-045',
      },
      breeding: {
        totalCalves: 3,
        lastCalvingDate: '2022-11-20',
        breedingHistory: [
          {
            date: '2023-07-10',
            method: 'AI',
            sireUsed: 'Sahiwal Elite-X',
            result: 'pregnant',
            calvingDate: '2024-04-15',
          },
        ],
      },
      geneticData: {
        inbreedingCoefficient: 0.015,
        estimatedBreedingValues: {
          milk: 112,
          fat: 115,
          protein: 110,
          fertility: 108,
          health: 105,
        },
        genomicData: {
          tested: true,
          testDate: '2021-09-01',
          markers: ['A2A2', 'AB', 'HORNED'],
        },
      },
    },
    {
      id: '3',
      name: 'Lakshmi',
      breed: 'Holstein Friesian',
      age: 3,
      weight: 580,
      lactationPeriod: 305,
      dailyMilkYield: 25,
      healthStatus: 'healthy',
      lastCheckup: '2024-01-18',
      acquisitionDate: '2023-01-20',
      pregnancyStatus: { isPregnant: false },
      healthIssues: [],
      vaccinations: [
        { name: 'FMD', date: '2024-01-15', nextDue: '2024-07-15' },
        { name: 'IBR', date: '2023-12-10', nextDue: '2024-12-10' },
      ],
      pedigree: {
        sireId: 'SIRE003',
        sireName: 'Holstein Supreme',
        sireBreed: 'Holstein Friesian',
        sireRegistrationNumber: 'HF-SUPREME-003',
        sireTattooNumber: 'HS-2020',
        damId: 'COW025',
        damName: 'Elite Holstein',
        damBreed: 'Holstein Friesian',
        damRegistrationNumber: 'HF-ELITE-025',
        damTattooNumber: 'EH-2019',
        registrationNumber: 'HF-2023-012',
        tattooNumber: 'LKS-2023',
        earTagNumber: '003-HF-2023',
        microchipId: '982000456789123',
        generation: 2,
        breedingCertificate: 'BC-HF-2023-012',
        birthCertificate: 'BIRTH-HF-2023-012',
      },
      breeding: {
        totalCalves: 1,
        lastCalvingDate: '2023-08-10',
        breedingHistory: [
          {
            date: '2022-11-15',
            method: 'AI',
            sireUsed: 'Holstein Elite-Y',
            result: 'pregnant',
            calvingDate: '2023-08-10',
            calfId: 'CALF002',
          },
        ],
      },
      geneticData: {
        inbreedingCoefficient: 0.008,
        estimatedBreedingValues: {
          milk: 125,
          fat: 98,
          protein: 115,
          fertility: 110,
          health: 102,
        },
        genomicData: {
          tested: true,
          testDate: '2023-02-01',
          markers: ['A1A1', 'AA', 'POLLED'],
        },
      },
    },
    {
      id: '4',
      name: 'Nandini',
      breed: 'Jersey',
      age: 6,
      weight: 400,
      lactationPeriod: 300,
      dailyMilkYield: 15,
      healthStatus: 'dry',
      lastCheckup: '2024-01-10',
      acquisitionDate: '2020-05-12',
      pregnancyStatus: { isPregnant: false },
      healthIssues: [],
      vaccinations: [
        { name: 'FMD', date: '2024-01-08', nextDue: '2024-07-08' },
        { name: 'BVD', date: '2023-11-15', nextDue: '2024-11-15' },
      ],
      pedigree: {
        sireId: 'SIRE004',
        sireName: 'Jersey Champion',
        sireBreed: 'Jersey',
        sireRegistrationNumber: 'JER-CHAMP-004',
        sireTattooNumber: 'JC-2018',
        damId: 'COW030',
        damName: 'Jersey Princess',
        damBreed: 'Jersey',
        damRegistrationNumber: 'JER-PRIN-030',
        damTattooNumber: 'JP-2017',
        registrationNumber: 'JER-2020-008',
        tattooNumber: 'NND-2020',
        earTagNumber: '004-JER-2020',
        microchipId: '982000789123456',
        generation: 5,
        breedingCertificate: 'BC-JER-2020-008',
        birthCertificate: 'BIRTH-JER-2020-008',
      },
      breeding: {
        totalCalves: 4,
        lastCalvingDate: '2023-03-20',
        breedingHistory: [
          {
            date: '2022-06-25',
            method: 'AI',
            sireUsed: 'Jersey Elite-Z',
            result: 'pregnant',
            calvingDate: '2023-03-20',
            calfId: 'CALF003',
          },
        ],
      },
      geneticData: {
        inbreedingCoefficient: 0.025,
        estimatedBreedingValues: {
          milk: 108,
          fat: 125,
          protein: 118,
          fertility: 105,
          health: 112,
        },
        genomicData: {
          tested: true,
          testDate: '2020-06-01',
          markers: ['A2A2', 'BB', 'HORNED'],
        },
      },
    },
  ]);

  // Elite Sire Database
  const [sireDatabase] = useState<Sire[]>([
    {
      id: 'SIRE001',
      name: 'Gir Elite-1',
      breed: 'Gir',
      registrationNumber: 'GIR-ELITE-001',
      tattooNumber: 'GE1-2019',
      earTagNumber: 'SIRE-001-GIR',
      microchipId: '982000111222333',
      origin: 'Gujarat Government Farm',
      birthDate: '2019-03-15',
      bloodlines: ['Traditional Gir', 'Saurashtra Line', 'Elite Selection'],
      damNumber: 'GIR-DAM-024',
      damName: 'Elite Gir Cow-24',
      damRegistrationNumber: 'GIR-ELITE-024',
      sireNumber: 'GIR-SIRE-001',
      sireName: 'Gir Foundation Bull',
      sireRegistrationNumber: 'GIR-FOUND-001',
      estimatedBreedingValues: {
        milk: 115,
        fat: 120,
        protein: 108,
        fertility: 110,
        health: 118,
        longevity: 112,
      },
      geneticLineage: {
        sire: 'Gir Foundation Bull',
        sireRegNumber: 'GIR-FOUND-001',
        dam: 'Elite Gir Cow-24',
        damRegNumber: 'GIR-ELITE-024',
        grandsire: 'Gir Legend-1',
        grandsireRegNumber: 'GIR-LEG-001',
        granddam: 'Foundation Female-12',
        granddamRegNumber: 'GIR-FOUND-012',
        maternalGrandsire: 'Saurashtra King',
        maternalGrandsireRegNumber: 'SAU-KING-001',
        maternalGranddam: 'Elite Daughter-18',
        maternalGranddamRegNumber: 'GIR-ELITE-018',
      },
      breedingCertificates: [
        'BC-GIR-2019-001',
        'ELITE-CERT-2020',
        'AI-APPROVED-2021',
      ],
      genomicTestResults: {
        tested: true,
        testDate: '2020-01-15',
        testLab: 'National Genomics Lab',
        geneticMarkers: ['A1A2', 'BB', 'POLLED', 'HEAT-TOL+', 'MILK+'],
        inbreedingCoefficient: 0.018,
        genomicAccuracy: 0.92,
      },
      progenyTested: true,
      progenyCount: 156,
      activeStatus: 'active',
      servicePrice: 2500,
      availableDoses: 45,
      lastCollection: '2024-01-20',
    },
    {
      id: 'SIRE002',
      name: 'Sahiwal Champion',
      breed: 'Sahiwal',
      registrationNumber: 'SAH-CHAMP-002',
      tattooNumber: 'SC-2017',
      earTagNumber: 'SIRE-002-SAH',
      microchipId: '982000222333444',
      origin: 'Punjab Elite Farm',
      birthDate: '2017-08-22',
      bloodlines: ['Montgomery Line', 'Elite Sahiwal', 'Champion Bloodline'],
      damNumber: 'SAH-DAM-035',
      damName: 'Sahiwal Queen Mother',
      damRegistrationNumber: 'SAH-QUEEN-035',
      sireNumber: 'SAH-SIRE-002',
      sireName: 'Sahiwal Supreme',
      sireRegistrationNumber: 'SAH-SUPREME-002',
      estimatedBreedingValues: {
        milk: 125,
        fat: 118,
        protein: 115,
        fertility: 120,
        health: 115,
        longevity: 118,
      },
      geneticLineage: {
        sire: 'Sahiwal Supreme',
        sireRegNumber: 'SAH-SUPREME-002',
        dam: 'Sahiwal Queen Mother',
        damRegNumber: 'SAH-QUEEN-035',
        grandsire: 'Montgomery King',
        grandsireRegNumber: 'MONT-KING-001',
        granddam: 'Elite Female-25',
        granddamRegNumber: 'SAH-ELITE-025',
        maternalGrandsire: 'Champion Sire-X',
        maternalGrandsireRegNumber: 'SAH-CHAMP-X',
        maternalGranddam: 'Superior Cow-42',
        maternalGranddamRegNumber: 'SAH-SUP-042',
      },
      breedingCertificates: [
        'BC-SAH-2017-002',
        'CHAMPION-CERT-2018',
        'AI-ELITE-2019',
      ],
      genomicTestResults: {
        tested: true,
        testDate: '2018-03-10',
        testLab: 'International Genomics Center',
        geneticMarkers: ['A2A2', 'AB', 'HORNED', 'HEAT-TOL++', 'MILK++'],
        inbreedingCoefficient: 0.012,
        genomicAccuracy: 0.95,
      },
      progenyTested: true,
      progenyCount: 234,
      activeStatus: 'active',
      servicePrice: 3000,
      availableDoses: 32,
      lastCollection: '2024-01-18',
    },
  ]);

  // Milk Records
  const [milkRecords] = useState<MilkRecord[]>([
    {
      id: 'MR001',
      cowId: '1',
      date: '2024-01-25',
      morningYield: 6.5,
      eveningYield: 5.5,
      quality: 'excellent',
      fatContent: 4.8,
    },
    {
      id: 'MR002',
      cowId: '2',
      date: '2024-01-25',
      morningYield: 9.0,
      eveningYield: 9.0,
      quality: 'good',
      fatContent: 5.2,
    },
    {
      id: 'MR003',
      cowId: '3',
      date: '2024-01-25',
      morningYield: 13.0,
      eveningYield: 12.0,
      quality: 'excellent',
      fatContent: 3.6,
    },
    {
      id: 'MR004',
      cowId: '4',
      date: '2024-01-25',
      morningYield: 0,
      eveningYield: 0,
      quality: 'poor',
      fatContent: 0,
    },
  ]);

  // Financial Records
  const [financialRecords] = useState<FinancialRecord[]>([
    {
      id: 'FR001',
      type: 'income',
      category: 'Milk Sales',
      amount: 15000,
      description: 'Daily milk sales to dairy',
      date: '2024-01-25',
    },
    {
      id: 'FR002',
      type: 'expense',
      category: 'Feed',
      amount: 8000,
      description: 'Cattle feed purchase',
      date: '2024-01-24',
    },
    {
      id: 'FR003',
      type: 'expense',
      category: 'Veterinary',
      amount: 2500,
      description: 'Health checkup and vaccination',
      date: '2024-01-23',
    },
    {
      id: 'FR004',
      type: 'income',
      category: 'Calf Sales',
      amount: 25000,
      description: 'Sale of male calf',
      date: '2024-01-20',
    },
  ]);

  // Calculate statistics
  const totalCows = cows.length;
  const pregnantCows = cows.filter(
    (cow) => cow.healthStatus === 'pregnant'
  ).length;
  const healthyCows = cows.filter(
    (cow) => cow.healthStatus === 'healthy'
  ).length;
  const totalDailyYield = cows.reduce(
    (sum, cow) => sum + cow.dailyMilkYield,
    0
  );
  const avgYieldPerCow = totalDailyYield / totalCows;
  const totalIncome = financialRecords
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = financialRecords
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Enhanced calculations
  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged);
  const criticalAlerts = alerts.filter(
    (alert) => alert.priority === 'critical' && !alert.acknowledged
  );
  const todayFeedCompleted = feedSchedules.filter(
    (feed) =>
      feed.date === new Date().toISOString().split('T')[0] && feed.completed
  ).length;
  const todayFeedTotal = feedSchedules.filter(
    (feed) => feed.date === new Date().toISOString().split('T')[0]
  ).length;
  const currentWeather = weatherData[0];
  const avgPerformance =
    performanceMetrics.length > 0
      ? {
          avgYield:
            performanceMetrics.reduce((sum, m) => sum + m.totalMilkYield, 0) /
            performanceMetrics.length,
          avgFat:
            performanceMetrics.reduce(
              (sum, m) => sum + m.averageFatContent,
              0
            ) / performanceMetrics.length,
          avgHealth:
            performanceMetrics.reduce((sum, m) => sum + m.healthScore, 0) /
            performanceMetrics.length,
        }
      : { avgYield: 0, avgFat: 0, avgHealth: 0 };

  // Auto-save functionality
  useEffect(() => {
    const saveData = () => {
      try {
        const farmData = {
          cows,
          weatherData,
          feedSchedules,
          alerts,
          performanceMetrics,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem('dairy-farm-data-v2', JSON.stringify(farmData));
      } catch (error) {}
    };

    const interval = setInterval(saveData, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [cows, weatherData, feedSchedules, alerts, performanceMetrics]);

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('dairy-farm-data-v2');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.weatherData) setWeatherData(parsed.weatherData);
        if (parsed.feedSchedules) setFeedSchedules(parsed.feedSchedules);
        if (parsed.alerts) setAlerts(parsed.alerts);
        if (parsed.performanceMetrics)
          setPerformanceMetrics(parsed.performanceMetrics);
      }
    } catch (error) {}
  }, []);

  // Alert management functions
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  const addAlert = useCallback((alert: Omit<Alert, 'id'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `A${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  // Feed schedule management
  const completeFeedSchedule = useCallback((feedId: string) => {
    setFeedSchedules((prev) =>
      prev.map((feed) =>
        feed.id === feedId ? { ...feed, completed: true } : feed
      )
    );
  }, []);

  const addFeedSchedule = useCallback((schedule: Omit<FeedSchedule, 'id'>) => {
    const newSchedule: FeedSchedule = {
      ...schedule,
      id: `FS${Date.now()}`,
    };
    setFeedSchedules((prev) => [...prev, newSchedule]);
  }, []);

  // Function to add new cattle record
  const addCattleRecord = useCallback((record: Omit<CattleRecord, 'id'>) => {
    const newRecord: CattleRecord = {
      ...record,
      id: `CR${Date.now()}`,
    };
    setCattleRecords((prev) => [...prev, newRecord]);
  }, []);

  // Search filtering functions
  const searchInBreeds = (query: string) => {
    return breedDatabase.filter(
      (breed) =>
        breed.name.toLowerCase().includes(query.toLowerCase()) ||
        breed.origin.toLowerCase().includes(query.toLowerCase()) ||
        breed.characteristics.some((char) =>
          char.toLowerCase().includes(query.toLowerCase())
        ) ||
        breed.advantages.some((adv) =>
          adv.toLowerCase().includes(query.toLowerCase())
        )
    );
  };

  const searchInCows = (query: string) => {
    return cows.filter(
      (cow) =>
        cow.name.toLowerCase().includes(query.toLowerCase()) ||
        cow.breed.toLowerCase().includes(query.toLowerCase()) ||
        cow.healthStatus.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchInProblems = (query: string) => {
    return problemDatabase.filter(
      (problem) =>
        problem.title.toLowerCase().includes(query.toLowerCase()) ||
        problem.category.toLowerCase().includes(query.toLowerCase()) ||
        problem.symptoms.some((symptom) =>
          symptom.toLowerCase().includes(query.toLowerCase())
        ) ||
        problem.solutions.some((solution) =>
          solution.toLowerCase().includes(query.toLowerCase())
        )
    );
  };

  // New render functions for enhanced features
  const renderDashboardTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        📊 {t.farmDashboard}
      </h3>

      {/* Weather Widget */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border, #e0e0e0)',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--fg)' }}>
            🌤️ {t.currentWeather}
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <div>
              <strong>{t.temperature}:</strong> {currentWeather?.temperature}°C
            </div>
            <div>
              <strong>{t.humidity}:</strong> {currentWeather?.humidity}%
            </div>
            <div>
              <strong>{t.conditions}:</strong> {currentWeather?.conditions}
            </div>
            <div>
              <strong>{t.wind}:</strong> {currentWeather?.windSpeed} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {totalDailyYield}L
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.dailyProduction}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}
          >
            {unacknowledgedAlerts.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.activeAlerts}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51cf66' }}
          >
            {todayFeedCompleted}/{todayFeedTotal}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.feedCompleted}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd43b' }}
          >
            {avgPerformance.avgHealth.toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.healthScore}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
          🚨 {t.recentAlerts}
        </h4>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              style={{
                background: alert.acknowledged
                  ? 'var(--surface, #f8f9fa)'
                  : alert.priority === 'critical'
                    ? '#ffebee'
                    : alert.priority === 'high'
                      ? '#fff3e0'
                      : 'var(--surface, #f8f9fa)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
                opacity: alert.acknowledged ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {alert.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {alert.message}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      background:
                        alert.priority === 'critical'
                          ? '#ff6b6b'
                          : alert.priority === 'high'
                            ? '#ff8787'
                            : alert.priority === 'medium'
                              ? '#ffd43b'
                              : '#51cf66',
                      color: alert.priority === 'medium' ? 'black' : 'white',
                    }}
                  >
                    {alert.priority}
                  </span>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
          ⚡ {t.quickActions}
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <button
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}
            onClick={() => setActiveTab('health')}
          >
            🏥 {t.healthMonitor}
          </button>
          <button
            style={{
              background: '#51cf66',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}
            onClick={() => setActiveTab('cows')}
          >
            🐄 {t.manageCattle}
          </button>
          <button
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}
            onClick={() => setActiveTab('records')}
          >
            📋 {t.viewRecords}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div style={{ padding: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ margin: 0, color: 'var(--fg)' }}>🚨 Alert Management</h3>
        <button
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
          onClick={() => setShowModal('addAlert')}
        >
          + Add Alert
        </button>
      </div>

      {/* Alert Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}
          >
            {criticalAlerts.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Critical
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff8787' }}
          >
            {
              alerts.filter((a) => a.priority === 'high' && !a.acknowledged)
                .length
            }
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            High Priority
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd43b' }}
          >
            {
              alerts.filter((a) => a.priority === 'medium' && !a.acknowledged)
                .length
            }
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Medium
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51cf66' }}
          >
            {alerts.filter((a) => a.acknowledged).length}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Resolved
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map((alert) => {
          const cow = alert.cowId
            ? cows.find((c) => c.id === alert.cowId)
            : null;
          return (
            <div
              key={alert.id}
              style={{
                background: alert.acknowledged
                  ? 'var(--surface, #f8f9fa)'
                  : alert.priority === 'critical'
                    ? '#ffebee'
                    : alert.priority === 'high'
                      ? '#fff3e0'
                      : 'var(--surface, #f8f9fa)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
                opacity: alert.acknowledged ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        background:
                          alert.type === 'health'
                            ? '#ff6b6b'
                            : alert.type === 'breeding'
                              ? '#ff8787'
                              : alert.type === 'feeding'
                                ? '#ffd43b'
                                : alert.type === 'milking'
                                  ? '#69db7c'
                                  : '#868e96',
                        color: 'white',
                      }}
                    >
                      {alert.type.toUpperCase()}
                    </span>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        background:
                          alert.priority === 'critical'
                            ? '#ff6b6b'
                            : alert.priority === 'high'
                              ? '#ff8787'
                              : alert.priority === 'medium'
                                ? '#ffd43b'
                                : '#51cf66',
                        color: alert.priority === 'medium' ? 'black' : 'white',
                      }}
                    >
                      {alert.priority.toUpperCase()}
                    </span>
                    {cow && (
                      <span
                        style={{ fontSize: '0.8rem', color: 'var(--muted)' }}
                      >
                        for {cow.name}
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--fg)' }}>
                    {alert.title}
                  </h4>
                  <p
                    style={{
                      margin: '0 0 0.5rem 0',
                      color: 'var(--muted)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {alert.message}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {alert.date}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('cows')}
                    style={{
                      background: 'transparent',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent)',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeatherTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        🌤️ Weather Monitoring
      </h3>

      {/* Current Weather */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
            Current Conditions
          </h4>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            {currentWeather?.conditions === 'sunny'
              ? '☀️'
              : currentWeather?.conditions === 'cloudy'
                ? '☁️'
                : currentWeather?.conditions === 'rainy'
                  ? '🌧️'
                  : '⛈️'}
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
            }}
          >
            {currentWeather?.temperature}°C
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>
            {currentWeather?.conditions.charAt(0).toUpperCase() +
              currentWeather?.conditions.slice(1)}
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💧</div>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {currentWeather?.humidity}%
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Humidity
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌧️</div>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {currentWeather?.rainfall}mm
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Rainfall
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💨</div>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {currentWeather?.windSpeed} km/h
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Wind Speed
          </div>
        </div>
      </div>

      {/* Weather History */}
      <div>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
          📈 Weather History
        </h4>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          {weatherData.map((weather, index) => (
            <div
              key={index}
              style={{
                background: 'var(--surface, #f8f9fa)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                  <div style={{ fontSize: '1.5rem' }}>
                    {weather.conditions === 'sunny'
                      ? '☀️'
                      : weather.conditions === 'cloudy'
                        ? '☁️'
                        : weather.conditions === 'rainy'
                          ? '🌧️'
                          : '⛈️'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{weather.date}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                      {weather.conditions}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                      {weather.temperature}°C
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Temp
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                      {weather.humidity}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Humidity
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                      {weather.rainfall}mm
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Rain
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        📊 Performance Analytics
      </h3>

      {/* Performance Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {avgPerformance.avgYield.toFixed(1)}L
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Avg Daily Yield
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51cf66' }}
          >
            {avgPerformance.avgFat.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Avg Fat Content
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd43b' }}
          >
            {avgPerformance.avgHealth.toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Health Score
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}
          >
            {((healthyCows / totalCows) * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Herd Health
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
          📈 Performance Trends
        </h4>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border, #e0e0e0)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <h5 style={{ margin: 0 }}>Daily Milk Production</h5>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              Last 3 days
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              gap: '1rem',
              height: '100px',
            }}
          >
            {performanceMetrics.map((metric, index) => {
              const height = (metric.totalMilkYield / 80) * 100;
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      background: 'var(--accent)',
                      height: `${height}%`,
                      width: '100%',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '0.5rem',
                    }}
                  ></div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {metric.totalMilkYield}L
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                    {metric.date.split('-')[2]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed Efficiency Analysis */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
          🌾 Feed Efficiency Analysis
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {feedSchedules
            .filter(
              (feed) => feed.date === new Date().toISOString().split('T')[0]
            )
            .map((feed) => {
              const cow = cows.find((c) => c.id === feed.cowId);
              return (
                <div
                  key={feed.id}
                  style={{
                    background: 'var(--surface, #f8f9fa)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border, #e0e0e0)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {cow?.name || 'Unknown Cow'}
                      </div>
                      <div
                        style={{ fontSize: '0.9rem', color: 'var(--muted)' }}
                      >
                        {feed.feedType} - {feed.amount}kg at {feed.time}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          background: feed.completed ? '#51cf66' : '#ffd43b',
                          color: feed.completed ? 'white' : 'black',
                        }}
                      >
                        {feed.completed ? 'Completed' : 'Pending'}
                      </span>
                      {!feed.completed && (
                        <button
                          onClick={() => completeFeedSchedule(feed.id)}
                          style={{
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
          💡 AI Recommendations
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '1rem',
              borderRadius: '8px',
              color: 'white',
            }}
          >
            <h5 style={{ margin: '0 0 0.5rem 0' }}>
              🚀 Productivity Optimization
            </h5>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Based on your current performance, consider increasing feed
              quality for{' '}
              {cows.find((c) => c.dailyMilkYield < avgYieldPerCow)?.name ||
                'underperforming cows'}{' '}
              to improve overall herd productivity.
            </p>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '1rem',
              borderRadius: '8px',
              color: 'white',
            }}
          >
            <h5 style={{ margin: '0 0 0.5rem 0' }}>🏥 Health Monitoring</h5>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Schedule routine health checkups for cows with lactation number 3+
              to maintain optimal health and productivity.
            </p>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              padding: '1rem',
              borderRadius: '8px',
              color: 'white',
            }}
          >
            <h5 style={{ margin: '0 0 0.5rem 0' }}>🧬 Breeding Strategy</h5>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Consider breeding your highest yielding cows with elite sires to
              improve genetic potential of future generations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCowsTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        🐄 {t.cattleInventory}
      </h3>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {totalCows}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.totalCattle}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}
          >
            {pregnantCows}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.pregnant}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51cf66' }}
          >
            {healthyCows}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.healthy}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {totalDailyYield}L
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.dailyYield}
          </div>
        </div>
      </div>

      {/* Cattle List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(searchQuery ? searchInCows(searchQuery) : cows).map((cow) => (
          <div
            key={cow.id}
            style={{
              background: 'var(--surface, #f8f9fa)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border, #e0e0e0)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <h4 style={{ margin: 0, color: 'var(--fg)' }}>{cow.name}</h4>
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  background:
                    cow.healthStatus === 'healthy'
                      ? '#51cf66'
                      : cow.healthStatus === 'pregnant'
                        ? '#ff6b6b'
                        : cow.healthStatus === 'sick'
                          ? '#ff8787'
                          : '#868e96',
                  color: 'white',
                }}
              >
                {cow.healthStatus}
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              <div>
                <strong>{t.breed}:</strong> {cow.breed}
              </div>
              <div>
                <strong>{t.age}:</strong> {cow.age} {t.years}
              </div>
              <div>
                <strong>{t.weight}:</strong> {cow.weight} kg
              </div>
              <div>
                <strong>{t.dailyYield}:</strong> {cow.dailyMilkYield}L
              </div>
              <div>
                <strong>{t.lastCheckup}:</strong> {cow.lastCheckup}
              </div>
              {cow.pregnancyStatus?.isPregnant && (
                <div>
                  <strong>{t.dueDate}:</strong> {cow.pregnancyStatus.dueDate}
                </div>
              )}
            </div>
            {cow.pedigree && (
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--muted)',
                }}
              >
                <strong>{t.registration}:</strong> {cow.pedigree.registrationNumber}{' '}
                |<strong> {t.sire}:</strong> {cow.pedigree.sireName} |
                <strong> {t.dam}:</strong> {cow.pedigree.damName}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBreedsTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        🧬 Comprehensive Breed Database
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(searchQuery ? searchInBreeds(searchQuery) : breedDatabase).map(
          (breed, index) => (
            <div
              key={index}
              style={{
                background: 'var(--surface, #f8f9fa)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedBreed(breed)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <h4 style={{ margin: 0, color: 'var(--fg)' }}>{breed.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {breed.origin}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}
              >
                <div>
                  <strong>Avg Milk Yield:</strong> {breed.avgMilkYield}
                </div>
                <div>
                  <strong>Avg Weight:</strong> {breed.avgWeight}
                </div>
                <div>
                  <strong>Climate:</strong> {breed.suitableClimate}
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Key Characteristics:</strong>
                <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {breed.characteristics.slice(0, 3).join(', ')}
                  {breed.characteristics.length > 3 && '...'}
                </div>
              </div>
              <div>
                <strong>Advantages:</strong>
                <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {breed.advantages.slice(0, 3).join(', ')}
                  {breed.advantages.length > 3 && '...'}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Breed Detail Modal */}
      {selectedBreed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedBreed(null)}
        >
          <div
            style={{
              background: 'var(--bg)',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              margin: '1rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: 0 }}>{selectedBreed.name}</h3>
              <button
                onClick={() => setSelectedBreed(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4>Breeding Data</h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <div>
                  <strong>Maturity Age:</strong>{' '}
                  {selectedBreed.breedingData.maturityAge}
                </div>
                <div>
                  <strong>First Calving:</strong>{' '}
                  {selectedBreed.breedingData.firstCalvingAge}
                </div>
                <div>
                  <strong>Calving Ease:</strong>{' '}
                  {selectedBreed.breedingData.calvingEase}
                </div>
                <div>
                  <strong>Birth Weight:</strong>{' '}
                  {selectedBreed.breedingData.birthWeight}
                </div>
                <div>
                  <strong>Gestation:</strong>{' '}
                  {selectedBreed.breedingData.gestationPeriod}
                </div>
                <div>
                  <strong>Lactation Length:</strong>{' '}
                  {selectedBreed.breedingData.lactationLength}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4>Performance Data</h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <div>
                  <strong>Peak Lactation:</strong>{' '}
                  {selectedBreed.performanceData.peakLactation}
                </div>
                <div>
                  <strong>Fat:</strong>{' '}
                  {selectedBreed.performanceData.milkComposition.fat}
                </div>
                <div>
                  <strong>Protein:</strong>{' '}
                  {selectedBreed.performanceData.milkComposition.protein}
                </div>
                <div>
                  <strong>Feed Efficiency:</strong>{' '}
                  {selectedBreed.performanceData.feedEfficiency}
                </div>
                <div>
                  <strong>Longevity Index:</strong>{' '}
                  {selectedBreed.performanceData.longevityIndex}
                </div>
                <div>
                  <strong>Adaptability:</strong>{' '}
                  {selectedBreed.performanceData.adaptabilityScore}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4>Care Requirements</h4>
              <div style={{ fontSize: '0.9rem' }}>
                <div>
                  <strong>Feed Requirements:</strong>{' '}
                  {selectedBreed.feedRequirements}
                </div>
                <div>
                  <strong>Suitable Climate:</strong>{' '}
                  {selectedBreed.suitableClimate}
                </div>
                <div>
                  <strong>Lifespan:</strong> {selectedBreed.lifespan}
                </div>
              </div>
            </div>

            <div>
              <h4>Common Diseases & Care</h4>
              <div style={{ fontSize: '0.9rem' }}>
                <div>
                  <strong>Common Diseases:</strong>{' '}
                  {selectedBreed.diseases.join(', ')}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Care Notes:</strong>
                </div>
                <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
                  {selectedBreed.careNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProblemsTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        🏥 Solutions Database
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(searchQuery ? searchInProblems(searchQuery) : problemDatabase).map(
          (problem) => (
            <div
              key={problem.id}
              style={{
                background: 'var(--surface, #f8f9fa)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <h4 style={{ margin: 0, color: 'var(--fg)' }}>
                  {problem.title}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      background:
                        problem.severity === 'critical'
                          ? '#ff6b6b'
                          : problem.severity === 'high'
                            ? '#ff8787'
                            : problem.severity === 'medium'
                              ? '#ffd43b'
                              : '#51cf66',
                      color: problem.severity === 'low' ? 'black' : 'white',
                    }}
                  >
                    {problem.severity}
                  </span>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      background:
                        problem.urgency === 'immediate'
                          ? '#ff6b6b'
                          : problem.urgency === 'within_24h'
                            ? '#ff8787'
                            : problem.urgency === 'within_week'
                              ? '#ffd43b'
                              : '#51cf66',
                      color: problem.urgency === 'routine' ? 'black' : 'white',
                    }}
                  >
                    {problem.urgency}
                  </span>
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Symptoms:</strong>
                <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
                  {problem.symptoms.map((symptom, i) => (
                    <li key={i} style={{ fontSize: '0.9rem' }}>
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Causes:</strong>
                <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
                  {problem.causes.map((cause, i) => (
                    <li key={i} style={{ fontSize: '0.9rem' }}>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Solutions:</strong>
                <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
                  {problem.solutions.map((solution, i) => (
                    <li key={i} style={{ fontSize: '0.9rem' }}>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Prevention:</strong>
                <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
                  {problem.prevention.map((prevention, i) => (
                    <li key={i} style={{ fontSize: '0.9rem' }}>
                      {prevention}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );

  const renderMilkTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        🥛 Milk Production Records
      </h3>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {totalDailyYield}L
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Total Today
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51cf66' }}
          >
            {(
              milkRecords.reduce((sum, r) => sum + r.fatContent, 0) /
              milkRecords.length
            ).toFixed(1)}
            %
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Avg Fat Content
          </div>
        </div>
      </div>

      {/* Milk Records */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {milkRecords.map((record) => {
          const cow = cows.find((c) => c.id === record.cowId);
          return (
            <div
              key={record.id}
              style={{
                background: 'var(--surface, #f8f9fa)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <h4 style={{ margin: 0, color: 'var(--fg)' }}>
                  {cow?.name || 'Unknown'}
                </h4>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    background:
                      record.quality === 'excellent'
                        ? '#51cf66'
                        : record.quality === 'good'
                          ? '#69db7c'
                          : record.quality === 'average'
                            ? '#ffd43b'
                            : '#ff8787',
                    color: record.quality === 'average' ? 'black' : 'white',
                  }}
                >
                  {record.quality}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <div>
                  <strong>Date:</strong> {record.date}
                </div>
                <div>
                  <strong>Morning:</strong> {record.morningYield}L
                </div>
                <div>
                  <strong>Evening:</strong> {record.eveningYield}L
                </div>
                <div>
                  <strong>Total:</strong>{' '}
                  {record.morningYield + record.eveningYield}L
                </div>
                <div>
                  <strong>Fat Content:</strong> {record.fatContent}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderHealthTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        🏥 {t.healthManagement}
      </h3>

      {/* Health Status Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51cf66' }}
          >
            {healthyCows}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.healthy}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}
          >
            {pregnantCows}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.pregnant}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#868e96' }}
          >
            {cows.filter((c) => c.healthStatus === 'dry').length}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{t.dry}</div>
        </div>
      </div>

      {/* Vaccination Schedule */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
          📅 {t.vaccinationSchedule}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cows.map((cow) => (
            <div
              key={cow.id}
              style={{
                background: 'var(--surface, #f8f9fa)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
              }}
            >
              <h5 style={{ margin: '0 0 0.5rem 0' }}>{cow.name}</h5>
              {cow.vaccinations?.map((vaccination, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  <div>
                    <strong>{vaccination.name}:</strong>
                  </div>
                  <div>{t.last}: {vaccination.date}</div>
                  <div>{t.next}: {vaccination.nextDue}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinanceTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        💰 Financial Management
      </h3>

      {/* Financial Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51cf66' }}
          >
            ₹{totalIncome.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Total Income
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}
          >
            ₹{totalExpenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Total Expenses
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: netProfit >= 0 ? '#51cf66' : '#ff6b6b',
            }}
          >
            ₹{netProfit.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Net Profit
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
          📊 Recent Transactions
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {financialRecords.map((record) => (
            <div
              key={record.id}
              style={{
                background: 'var(--surface, #f8f9fa)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <h5 style={{ margin: 0, color: 'var(--fg)' }}>
                  {record.category}
                </h5>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    background:
                      record.type === 'income' ? '#51cf66' : '#ff6b6b',
                    color: 'white',
                  }}
                >
                  {record.type === 'income' ? '+' : '-'}₹
                  {record.amount.toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                {record.description} • {record.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        📊 Farm Insights & Recommendations
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Productivity Analysis */}
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border, #e0e0e0)',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--fg)' }}>
            📈 Productivity Analysis
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.5rem',
            }}
          >
            <div>
              <strong>Average daily yield per cow:</strong>{' '}
              {avgYieldPerCow.toFixed(1)}L
            </div>
            <div>
              <strong>Top performer:</strong> Lakshmi (25L/day)
            </div>
            <div>
              <strong>Total daily production:</strong> {totalDailyYield}L
            </div>
            <div>
              <strong>Herd efficiency:</strong>{' '}
              {((healthyCows / totalCows) * 100).toFixed(1)}%
            </div>
          </div>
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: '#e3f2fd',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            <strong>Recommendation:</strong> Consider breeding from
            high-yielding cows to improve overall herd productivity.
          </div>
        </div>

        {/* Breeding Program */}
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border, #e0e0e0)',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--fg)' }}>
            🧬 Breeding Program
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.5rem',
            }}
          >
            <div>
              <strong>{t.pregnantCows}</strong> {pregnantCows}
            </div>
            <div>
              <strong>{t.expectedCalves}</strong> {pregnantCows}
            </div>
            <div>
              <strong>{t.activeSires}</strong>{' '}
              {sireDatabase.filter((s) => s.activeStatus === 'active').length}
            </div>
          </div>
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: '#fff3e0',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            <strong>{t.recommendation}</strong> {t.recommendationText}
          </div>
        </div>

        {/* Health Status */}
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border, #e0e0e0)',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--fg)' }}>
            🏥 {t.healthStatus}
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.5rem',
            }}
          >
            <div>
              <strong>{t.healthyCows}</strong> {healthyCows}/{totalCows}
            </div>
            <div>
              <strong>{t.dueForCheckup}</strong> 2
            </div>
            <div>
              <strong>{t.healthRate}</strong>{' '}
              {((healthyCows / totalCows) * 100).toFixed(1)}%
            </div>
          </div>
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: '#e8f5e8',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            <strong>Recommendation:</strong> Schedule regular health checkups
            every 30 days to maintain herd health.
          </div>
        </div>

        {/* Financial Health */}
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border, #e0e0e0)',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--fg)' }}>
            💰 Financial Health
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.5rem',
            }}
          >
            <div>
              <strong>Daily income potential:</strong> ₹
              {(totalDailyYield * 50).toLocaleString()}
            </div>
            <div>
              <strong>Cost per liter:</strong> ₹
              {(totalExpenses / (totalDailyYield * 30)).toFixed(2)}
            </div>
            <div>
              <strong>Profit margin:</strong>{' '}
              {((netProfit / totalIncome) * 100).toFixed(1)}%
            </div>
          </div>
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: '#f3e5f5',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            <strong>Recommendation:</strong> Focus on reducing feed costs while
            maintaining milk quality for better profitability.
          </div>
        </div>

        {/* Seasonal Planning */}
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border, #e0e0e0)',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--fg)' }}>
            🌱 Seasonal Planning
          </h4>
          <div style={{ fontSize: '0.9rem' }}>
            <div>
              <strong>Current season considerations:</strong>
            </div>
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
              <li>Increase water availability during summer</li>
              <li>Plan fodder storage for monsoon season</li>
              <li>Schedule vaccinations before disease-prone seasons</li>
            </ul>
          </div>
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: '#e1f5fe',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            <strong>Recommendation:</strong> Prepare seasonal management plans
            2-3 months in advance.
          </div>
        </div>

        {/* Sustainability Tips */}
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border, #e0e0e0)',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--fg)' }}>
            🌿 Sustainability Tips
          </h4>
          <div style={{ fontSize: '0.9rem' }}>
            <div>
              <strong>Eco-friendly practices:</strong>
            </div>
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
              <li>Implement biogas plant for manure management</li>
              <li>Use organic feed supplements when possible</li>
              <li>Practice rotational grazing to maintain pasture health</li>
            </ul>
          </div>
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: '#f1f8e9',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            <strong>Recommendation:</strong> Adopt sustainable practices for
            long-term farm viability and environmental benefits.
          </div>
        </div>
      </div>
    </div>
  );

  const renderBreedingTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        🧬 Advanced Breeding Management
      </h3>

      {/* Breeding Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {cows.reduce(
              (sum, cow) => sum + (cow.breeding?.totalCalves || 0),
              0
            )}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Total Breedings
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}
          >
            {pregnantCows}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Pending
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51cf66' }}
          >
            {sireDatabase.filter((s) => s.activeStatus === 'active').length}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Active Sires
          </div>
        </div>
      </div>

      {/* Elite Sire Database */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
          🏆 Elite Sire Database
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sireDatabase.map((sire) => (
            <div
              key={sire.id}
              style={{
                background: 'var(--surface, #f8f9fa)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <h5 style={{ margin: 0, color: 'var(--fg)' }}>{sire.name}</h5>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    background:
                      sire.activeStatus === 'active'
                        ? '#51cf66'
                        : sire.activeStatus === 'retired'
                          ? '#868e96'
                          : '#ff8787',
                    color: 'white',
                  }}
                >
                  {sire.activeStatus}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem',
                }}
              >
                <div>
                  <strong>Breed:</strong> {sire.breed}
                </div>
                <div>
                  <strong>Birth Date:</strong> {sire.birthDate}
                </div>
                <div>
                  <strong>Registration:</strong> {sire.registrationNumber}
                </div>
                <div>
                  <strong>Progeny Count:</strong> {sire.progenyCount}
                </div>
                <div>
                  <strong>Service Price:</strong> ₹{sire.servicePrice}
                </div>
                <div>
                  <strong>Available Doses:</strong> {sire.availableDoses}
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Estimated Breeding Values:</strong>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <div>Milk: {sire.estimatedBreedingValues.milk}</div>
                  <div>Fat: {sire.estimatedBreedingValues.fat}</div>
                  <div>Protein: {sire.estimatedBreedingValues.protein}</div>
                  <div>Fertility: {sire.estimatedBreedingValues.fertility}</div>
                  <div>Health: {sire.estimatedBreedingValues.health}</div>
                  <div>Longevity: {sire.estimatedBreedingValues.longevity}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                <strong>Bloodlines:</strong> {sire.bloodlines.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecordsTab = () => (
    <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: 'var(--fg)' }}>
          📋 {language === 'english' ? 'Cattle Breeding & Health Records' : 'ਪਸ਼ੂ ਪ੍ਰਜਨਨ ਅਤੇ ਸਿਹਤ ਰਿਕਾਰਡ'}
        </h3>
        <button
          onClick={() => { setAddForm({
            breed: 'Gir',
            tagNo: '',
            birthDate: new Date().toISOString().split('T')[0],
            motherCode: '',
            fatherName: '',
            lactation: 1,
            aiLastCheckup: '',
            heatCycle: 'Regular - 21 days',
            deworming: '',
            semenDetail: '',
          }); setShowModal('addRecord'); }}
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
          }}
        >
          + {language === 'english' ? 'Add New Record' : 'ਨਵਾਂ ਰਿਕਾਰਡ ਜੋੜੋ'}
        </button>
      </div>

      {/* Records Cards with Button-Style Cells */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {cattleRecords.map((record) => (
          <div
            key={record.id}
            style={{
              background: 'var(--surface, #f8f9fa)',
              border: '2px solid var(--border, #e0e0e0)',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border, #e0e0e0)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Record Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #667eea 100%)',
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                  🐄 {record.breed}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                  {language === 'english' ? 'Tag:' : 'ਟੈਗ:'} {record.tagNo}
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: 'white',
              }}>
                {language === 'english' ? 'Lactation' : 'ਦੁੱਧ ਦੀ ਮਿਆਦ'}: {record.lactation}
              </div>
            </div>

            {/* Record Details - Button-Style Cells */}
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {/* Birth Date Cell */}
              <button
                type="button"
                style={{
                  background: 'var(--bg)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onClick={() => { setSelectedRecord(record); setShowModal('viewRecord'); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-light, #f0f4ff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg)';
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  🎂 {language === 'english' ? 'BIRTH DATE' : 'ਜਨਮ ਤਾਰੀਖ'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--fg)' }}>
                  {record.birthDate}
                </div>
              </button>

              {/* Mother Code Cell */}
              <button
                type="button"
                style={{
                  background: 'var(--bg)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onClick={() => { setSelectedRecord(record); setShowModal('viewRecord'); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-light, #f0f4ff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg)';
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  👩 {language === 'english' ? 'MOTHER CODE' : 'ਮਾਂ ਕੋਡ'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--fg)', fontFamily: 'monospace' }}>
                  {record.motherCode}
                </div>
              </button>

              {/* Father Name Cell */}
              <button
                type="button"
                style={{
                  background: 'var(--bg)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onClick={() => { setSelectedRecord(record); setShowModal('viewRecord'); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-light, #f0f4ff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg)';
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  👨 {language === 'english' ? 'FATHER NAME' : 'ਪਿਤਾ ਨਾਮ'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--fg)' }}>
                  {record.fatherName}
                </div>
              </button>

              {/* AI Checkup Cell */}
              <button
                type="button"
                style={{
                  background: 'var(--bg)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onClick={() => { setSelectedRecord(record); setShowModal('viewRecord'); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-light, #f0f4ff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg)';
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  💉 {language === 'english' ? 'AI (LAST CHECKUP)' : 'AI (ਆਖਰੀ ਜਾਂਚ)'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--fg)' }}>
                  {record.aiLastCheckup}
                </div>
              </button>

              {/* Heat Cycle Cell */}
              <button
                type="button"
                style={{
                  background: 'var(--bg)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onClick={() => { setSelectedRecord(record); setShowModal('viewRecord'); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-light, #f0f4ff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg)';
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  🔄 {language === 'english' ? 'HEAT CYCLE' : 'ਗਰਮੀ ਚੱਕਰ'}
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: record.heatCycle.includes('Pregnant') ? '#ff6b6b' :
                         record.heatCycle.includes('Dry') ? '#868e96' : '#51cf66',
                }}>
                  {record.heatCycle}
                </div>
              </button>

              {/* Deworming Cell */}
              <button
                style={{
                  background: 'var(--bg)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-light, #f0f4ff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg)';
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  💊 {language === 'english' ? 'DEWORMING' : 'ਕੀੜੇ ਮਾਰੂ ਦਵਾਈ'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--fg)' }}>
                  {record.deworming}
                </div>
              </button>

              {/* Semen Detail Cell */}
              <button
                type="button"
                style={{
                  background: 'var(--bg)',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  gridColumn: 'span 1',
                }}
                onClick={() => { setSelectedRecord(record); setShowModal('viewRecord'); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--accent-light, #f0f4ff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--bg)';
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  🧬 {language === 'english' ? 'SEMEN DETAIL' : 'ਵੀਰਜ ਵੇਰਵਾ'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--fg)', fontFamily: 'monospace' }}>
                  {record.semenDetail}
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg)',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
            }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedRecord(record);
                  setShowModal('viewRecord');
                }}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                👁️ {language === 'english' ? 'View Details' : 'ਵੇਰਵੇ ਦੇਖੋ'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRecord(record);
                  setShowModal('editRecord');
                }}
                style={{
                  background: '#4dabf7',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                ✏️ {language === 'english' ? 'Edit' : 'ਸੋਧੋ'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(language === 'english' ? 'Delete this record?' : 'ਕੀ ਤੁਸੀਂ ਇਹ ਰਿਕਾਰਡ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?')) {
                    deleteCattleRecord(record.id);
                  }
                }}
                style={{
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                🗑️ {language === 'english' ? 'Delete' : 'ਮਿਟਾਓ'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}
          >
            {cattleRecords.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            Total Records
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}
          >
            {
              cattleRecords.filter((r) => r.heatCycle.includes('Pregnant'))
                .length
            }
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.pregnant}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#51cf66' }}
          >
            {
              cattleRecords.filter((r) => r.heatCycle.includes('Regular'))
                .length
            }
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.regularCycle}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface, #f8f9fa)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd43b' }}
          >
            {(
              cattleRecords.reduce((sum, r) => sum + r.lactation, 0) /
              cattleRecords.length
            ).toFixed(1)}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {t.avgLactation}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'var(--surface, #f8f9fa)',
          borderRadius: '8px',
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{t.legend}</h4>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
          }}
        >
          <div>
            <span style={{ color: '#51cf66', fontWeight: 'bold' }}>●</span>{' '}
            {t.lactation12Young}
          </div>
          <div>
            <span style={{ color: '#ffd43b', fontWeight: 'bold' }}>●</span>{' '}
            {t.lactation34Mature}
          </div>
          <div>
            <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>●</span>{' '}
            {t.lactation5Senior}
          </div>
          <div>
            <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>●</span>{' '}
            {t.pregnant}
          </div>
          <div>
            <span style={{ color: '#51cf66', fontWeight: 'bold' }}>●</span>{' '}
            {t.regularHeatCycle}
          </div>
          <div>
            <span style={{ color: '#868e96', fontWeight: 'bold' }}>●</span>{' '}
            {t.dryPeriod}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGenealogyTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
        🧬 Genealogy & Pedigree Analysis
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {cows
          .filter((cow) => cow.pedigree)
          .map((cow) => (
            <div
              key={cow.id}
              style={{
                background: 'var(--surface, #f8f9fa)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border, #e0e0e0)',
              }}
            >
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--fg)' }}>
                {cow.name} - Pedigree Information
              </h4>

              {cow.pedigree && (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>
                      <strong>Registration:</strong>{' '}
                      {cow.pedigree.registrationNumber}
                    </div>
                    <div>
                      <strong>Tattoo:</strong> {cow.pedigree.tattooNumber}
                    </div>
                    <div>
                      <strong>Ear Tag:</strong> {cow.pedigree.earTagNumber}
                    </div>
                    <div>
                      <strong>Microchip:</strong> {cow.pedigree.microchipId}
                    </div>
                    <div>
                      <strong>Generation:</strong> {cow.pedigree.generation}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>
                        Sire Information
                      </h5>
                      <div style={{ fontSize: '0.9rem' }}>
                        <div>
                          <strong>Name:</strong> {cow.pedigree.sireName}
                        </div>
                        <div>
                          <strong>Breed:</strong> {cow.pedigree.sireBreed}
                        </div>
                        <div>
                          <strong>Registration:</strong>{' '}
                          {cow.pedigree.sireRegistrationNumber}
                        </div>
                        <div>
                          <strong>Tattoo:</strong>{' '}
                          {cow.pedigree.sireTattooNumber}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>
                        Dam Information
                      </h5>
                      <div style={{ fontSize: '0.9rem' }}>
                        <div>
                          <strong>Name:</strong> {cow.pedigree.damName}
                        </div>
                        <div>
                          <strong>Breed:</strong> {cow.pedigree.damBreed}
                        </div>
                        <div>
                          <strong>Registration:</strong>{' '}
                          {cow.pedigree.damRegistrationNumber}
                        </div>
                        <div>
                          <strong>Tattoo:</strong>{' '}
                          {cow.pedigree.damTattooNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0' }}>Certificates</h5>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div>
                        <strong>Birth Certificate:</strong>{' '}
                        {cow.pedigree.birthCertificate}
                      </div>
                      <div>
                        <strong>Breeding Certificate:</strong>{' '}
                        {cow.pedigree.breedingCertificate}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {cow.geneticData && (
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0' }}>Genetic Data</h5>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>
                      <strong>Inbreeding Coefficient:</strong>{' '}
                      {cow.geneticData.inbreedingCoefficient}
                    </div>
                    <div>
                      <strong>Genomic Tested:</strong>{' '}
                      {cow.geneticData.genomicData?.tested ? 'Yes' : 'No'}
                    </div>
                    {cow.geneticData.genomicData?.tested && (
                      <div>
                        <strong>Test Date:</strong>{' '}
                        {cow.geneticData.genomicData.testDate}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Estimated Breeding Values:</strong>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      <div>
                        Milk: {cow.geneticData.estimatedBreedingValues.milk}
                      </div>
                      <div>
                        Fat: {cow.geneticData.estimatedBreedingValues.fat}
                      </div>
                      <div>
                        Protein:{' '}
                        {cow.geneticData.estimatedBreedingValues.protein}
                      </div>
                      <div>
                        Fertility:{' '}
                        {cow.geneticData.estimatedBreedingValues.fertility}
                      </div>
                      <div>
                        Health: {cow.geneticData.estimatedBreedingValues.health}
                      </div>
                    </div>
                  </div>
                  {cow.geneticData.genomicData?.markers && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      <strong>Genetic Markers:</strong>{' '}
                      {cow.geneticData.genomicData.markers.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {cow.breeding && (
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0' }}>Breeding Summary</h5>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>
                      <strong>Total Calves:</strong> {cow.breeding.totalCalves}
                    </div>
                    <div>
                      <strong>Last Calving:</strong>{' '}
                      {cow.breeding.lastCalvingDate}
                    </div>
                  </div>
                  {cow.breeding.breedingHistory.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Recent Breedings:</strong>
                      {cow.breeding.breedingHistory.map((breeding, index) => (
                        <div
                          key={index}
                          style={{
                            fontSize: '0.8rem',
                            marginTop: '0.25rem',
                            paddingLeft: '1rem',
                          }}
                        >
                          {breeding.date} - {breeding.method} with{' '}
                          {breeding.sireUsed} - {breeding.result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );

  // Render Videos Tab
  const renderVideosTab = () => (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--fg)' }}>
          🎥 {t.videoLibrary}
        </h3>
        <button
          onClick={() => setShowModal('uploadVideo')}
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
          }}
        >
          + {t.uploadVideo}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {cattleVideos.map((video) => (
          <div
            key={video.id}
            style={{
              background: 'var(--surface, #f8f9fa)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid var(--border, #e0e0e0)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ background: '#ddd', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
              🎥
            </div>
            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--fg)', marginBottom: '0.5rem' }}>
                {video.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                {video.description}
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                <span>⏱️ {video.duration}</span>
                <span>👁️ {video.views}</span>
                <span>👍 {video.likes}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                By {video.uploadedBy} • {video.uploadDate}
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{
                  background: video.category === 'health' ? '#ff6b6b' :
                    video.category === 'breeding' ? '#51cf66' :
                    video.category === 'training' ? '#4dabf7' :
                    video.category === 'feeding' ? '#ffd43b' : '#868e96',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}>
                  {video.category.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="dairy-farm-manager miniapp-integration"
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--bg, #ffffff)',
        color: 'var(--fg, #000000)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Search Bar */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border, #e0e0e0)',
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search breeds, cattle, problems, records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--border, #e0e0e0)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            background: 'var(--bg)',
            color: 'var(--fg)',
          }}
        />
      </div>

      {/* Enhanced Header with Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '1px solid var(--border, #e0e0e0)',
          background: 'var(--surface, #f8f9fa)',
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: 'var(--fg)' }}>
            🐄 {t.appTitle}
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            {t.appSubtitle}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowLanguageModal(true)}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
            title={t.switchLanguage}
          >
            {language === 'english' ? 'ਪੰਜਾਬੀ' : 'English'}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            title="Toggle fullscreen"
          >
            {isFullscreen ? '⊖' : '⊞'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            title={t.close}
          >
            ×
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border, #e0e0e0)',
          background: 'var(--surface, #f8f9fa)',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'dashboard', label: `📊 ${t.dashboard}` },
          { id: 'cows', label: `🐄 ${t.cattle}` },
          { id: 'records', label: `📋 ${t.records}` },
          { id: 'health', label: `🏥 ${t.health}` },
          { id: 'videos', label: `🎥 ${t.videos}` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: '0 0 auto',
              padding: '0.75rem 1rem',
              border: 'none',
              background:
                activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--fg)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ height: 'calc(100% - 180px)', overflowY: 'auto' }}>
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'cows' && renderCowsTab()}
        {activeTab === 'records' && renderRecordsTab()}
        {activeTab === 'health' && renderHealthTab()}
        {activeTab === 'videos' && renderVideosTab()}
      </div>

      {/* Enhanced Modals */}
      {showModal === 'addRecord' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(null)}
        >
              <div
            style={{
              background: 'var(--bg)',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="addRecordHeading"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="addRecordHeading" style={{ margin: '0 0 1rem 0' }}>{t.addNewRecord}</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.breed}
                </label>
                <select
                  ref={(el) => { addModalFirstRef.current = el; }}
                  value={addForm.breed || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, breed: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                >
                  <option value="Gir">Gir</option>
                  <option value="Sahiwal">Sahiwal</option>
                  <option value="Holstein Friesian">Holstein Friesian</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Red Sindhi">Red Sindhi</option>
                  <option value="Tharparkar">Tharparkar</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.tagNo}
                </label>
                <input
                  type="text"
                  placeholder="e.g., 007-NEW-2024"
                  value={addForm.tagNo || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, tagNo: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.birthDate}
                </label>
                <input
                  type="date"
                  value={addForm.birthDate || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, birthDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.motherCode}
                </label>
                <input
                  type="text"
                  placeholder="e.g., MOTHER-CODE-001"
                  value={addForm.motherCode || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, motherCode: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.fatherName}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Elite Bull-001"
                  value={addForm.fatherName || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, fatherName: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.lactation}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1"
                  value={addForm.lactation ?? ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, lactation: parseInt(e.target.value || '0') || 0 }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.aiLastCheckup}
                </label>
                <input
                  type="date"
                  value={addForm.aiLastCheckup || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, aiLastCheckup: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.heatCycle}
                </label>
                <select
                  value={addForm.heatCycle || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, heatCycle: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}
                >
                  <option value="Regular - 21 days">{t.regular21days}</option>
                  <option value="Regular - 19 days">{t.regular19days}</option>
                  <option value="Regular - 20 days">{t.regular20days}</option>
                  <option value="Regular - 22 days">{t.regular22days}</option>
                  <option value="Pregnant - Due 2024-04-15">
                    {t.pregnantDue}
                  </option>
                  <option value="Dry period">{t.dryOption}</option>
                  <option value="Irregular">{t.irregular}</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.deworming}
                </label>
                <input
                  type="date"
                  value={addForm.deworming || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, deworming: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {t.semenDetail}
                </label>
                <input
                  type="text"
                  placeholder="e.g., ELITE-001 (Batch: E-2024-01)"
                  value={addForm.semenDetail || ''}
                  onChange={(e) => setAddForm((p) => ({ ...p, semenDetail: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                marginTop: '2rem',
              }}
            >
              <button
                type="button"
                onClick={() => setShowModal(null)}
                style={{
                  background: 'transparent',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  const record = {
                    breed: addForm.breed || 'Gir',
                    tagNo: addForm.tagNo || `NEW-TAG-${Date.now()}`,
                    birthDate: addForm.birthDate || new Date().toISOString().split('T')[0],
                    motherCode: addForm.motherCode || 'MOTHER-CODE-001',
                    fatherName: addForm.fatherName || 'Elite Bull-001',
                    lactation: addForm.lactation ?? 1,
                    aiLastCheckup: addForm.aiLastCheckup || new Date().toISOString().split('T')[0],
                    heatCycle: addForm.heatCycle || 'Regular - 21 days',
                    deworming: addForm.deworming || new Date().toISOString().split('T')[0],
                    semenDetail: addForm.semenDetail || 'ELITE-001 (Batch: E-2024-01)',
                  };

                  addCattleRecord(record);
                  setShowModal(null);
                }}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {t.addRecord}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal === 'addAlert' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(null)}
        >
          <div
            style={{
              background: 'var(--bg)',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0' }}>Add New Alert</h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Alert title"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  Message
                </label>
                <textarea
                  placeholder="Alert message"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  Priority
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  Type
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}
                >
                  <option value="health">Health</option>
                  <option value="breeding">Breeding</option>
                  <option value="feeding">Feeding</option>
                  <option value="milking">Milking</option>
                  <option value="vaccination">Vaccination</option>
                </select>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={() => setShowModal(null)}
                  style={{
                    background: 'transparent',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add alert logic here
                    setShowModal(null);
                  }}
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Add Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowLanguageModal(false)}
        >
          <div
            style={{
              background: 'var(--bg)',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--fg)' }}>{t.selectLanguage}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => {
                  setLanguage('english');
                  setShowLanguageModal(false);
                }}
                style={{
                  background: language === 'english' ? 'var(--accent)' : 'var(--surface)',
                  color: language === 'english' ? 'white' : 'var(--fg)',
                  border: `2px solid ${language === 'english' ? 'var(--accent)' : 'var(--border)'}`,
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => {
                  setLanguage('punjabi');
                  setShowLanguageModal(false);
                }}
                style={{
                  background: language === 'punjabi' ? 'var(--accent)' : 'var(--surface)',
                  color: language === 'punjabi' ? 'white' : 'var(--fg)',
                  border: `2px solid ${language === 'punjabi' ? 'var(--accent)' : 'var(--border)'}`,
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
              >
                🇮🇳 ਪੰਜਾਬੀ (Punjabi)
              </button>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLanguageModal(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {showModal === 'uploadVideo' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(null)}
        >
          <div
            style={{
              background: 'var(--bg)',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--fg)' }}>🎥 {t.uploadVideo}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: 'var(--fg)',
                  }}
                >
                  {language === 'english' ? 'Video Title' : 'ਵੀਡੀਓ ਸਿਰਲੇਖ'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'english' ? 'e.g., Milking Techniques for Sahiwal' : 'ਉਦਾਹਰਨ: ਸਾਹੀਵਾਲ ਲਈ ਦੁੱਧ ਕੱਢਣ ਦੀਆਂ ਤਕਨੀਕਾਂ'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: 'var(--fg)',
                  }}
                >
                  {language === 'english' ? 'Description' : 'ਵਰਣਨ'}
                </label>
                <textarea
                  placeholder={language === 'english' ? 'Describe what your video covers...' : 'ਆਪਣੇ ਵੀਡੀਓ ਵਿੱਚ ਕੀ ਹੈ ਦੱਸੋ...'}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: 'var(--fg)',
                  }}
                >
                  {language === 'english' ? 'Category' : 'ਸ਼੍ਰੇਣੀ'}
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                >
                  <option value="training">{language === 'english' ? 'Training' : 'ਸਿਖਲਾਈ'}</option>
                  <option value="health">{language === 'english' ? 'Health' : 'ਸਿਹਤ'}</option>
                  <option value="breeding">{language === 'english' ? 'Breeding' : 'ਪ੍ਰਜਨਨ'}</option>
                  <option value="feeding">{language === 'english' ? 'Feeding' : 'ਖੁਰਾਕ'}</option>
                  <option value="general">{language === 'english' ? 'General' : 'ਆਮ'}</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                    color: 'var(--fg)',
                  }}
                >
                  {language === 'english' ? 'Video File' : 'ਵੀਡੀਓ ਫ਼ਾਈਲ'}
                </label>
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--surface)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📹</div>
                  <div style={{ color: 'var(--fg)', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {language === 'english' ? 'Click to upload or drag and drop' : 'ਅੱਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ'}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {language === 'english' ? 'MP4, MOV, AVI (Max 500MB)' : 'MP4, MOV, AVI (ਵੱਧ ਤੋਂ ਵੱਧ 500MB)'}
                  </div>
                  <input type="file" accept="video/*" style={{ display: 'none' }} />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                  marginTop: '1rem',
                }}
              >
                <button
                  onClick={() => setShowModal(null)}
                  style={{
                    background: 'transparent',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {language === 'english' ? 'Cancel' : 'ਰੱਦ ਕਰੋ'}
                </button>
                <button
                  onClick={() => {
                    // Video upload logic here
                    setShowModal(null);
                  }}
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {language === 'english' ? '📤 Upload Video' : '📤 ਵੀਡੀਓ ਅੱਪਲੋਡ ਕਰੋ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dairy-farm-manager.miniapp-integration {
          position: static !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          max-height: none !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          animation: none !important;
          transform: none !important;
        }

        .dairy-farm-manager {
          --bg: var(--background, #ffffff);
          --surface: var(--surface, #f8f9fa);
          --border: var(--border, #e0e0e0);
          --fg: var(--foreground, #000000);
          --muted: var(--muted-foreground, #666666);
          --accent: var(--primary, #007bff);
          --hover: var(--hover, #f0f0f0);
        }

        /* Enhanced animations and transitions */
        .dairy-farm-manager button {
          transition: all 0.2s ease;
        }

        .dairy-farm-manager button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .dairy-farm-manager input,
        .dairy-farm-manager select,
        .dairy-farm-manager textarea {
          transition: all 0.2s ease;
        }

        .dairy-farm-manager input:focus,
        .dairy-farm-manager select:focus,
        .dairy-farm-manager textarea:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }

        /* Responsive design improvements */
        @media (max-width: 768px) {
          .dairy-farm-manager .tab-navigation {
            flex-wrap: wrap;
          }

          .dairy-farm-manager .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .dairy-farm-manager .metrics-grid {
            grid-template-columns: 1fr;
          }

          .dairy-farm-manager .header-controls {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        /* Loading states */
        .dairy-farm-manager .loading {
          opacity: 0.6;
          pointer-events: none;
        }

        .dairy-farm-manager .loading::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          margin: -10px 0 0 -10px;
          border: 2px solid var(--accent);
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Success/Error states */
        .dairy-farm-manager .success {
          background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
          color: white;
        }

        .dairy-farm-manager .error {
          background: linear-gradient(135deg, #ff6b6b 0%, #fa5252 100%);
          color: white;
        }

        .dairy-farm-manager .warning {
          background: linear-gradient(135deg, #ffd43b 0%, #fab005 100%);
          color: black;
        }

        /* Enhanced card hover effects */
        .dairy-farm-manager .card {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .dairy-farm-manager .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        /* Progress bars */
        .dairy-farm-manager .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .dairy-farm-manager .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent) 0%, #ff8787 100%);
          transition: width 0.3s ease;
        }

        /* Tooltip styles */
        .dairy-farm-manager .tooltip {
          position: relative;
        }

        .dairy-farm-manager .tooltip::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--fg);
          color: var(--bg);
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 1000;
        }

        .dairy-farm-manager .tooltip:hover::after {
          opacity: 1;
        }
      `}</style>

      {/* Record View and Edit Modals */}
      <ViewRecordModal
        visible={showModal === 'viewRecord'}
        record={selectedRecord}
        language={language}
        onClose={() => { setShowModal(null); setSelectedRecord(null); }}
      />

      <EditRecordModal
        visible={showModal === 'editRecord'}
        record={selectedRecord}
        language={language}
        onClose={() => { setShowModal(null); setSelectedRecord(null); }}
        onSave={(updates) => {
          if (!selectedRecord) return;
          updateCattleRecord(selectedRecord.id, updates);
          setShowModal(null);
          setSelectedRecord(null);
        }}
      />
    </div>
  );
}
