import {
  User,
  Initiative,
  Directorate,
  AfricanRegion,
  StrategicResultArea,
  StrategicDeliveryPathway,
  TaskItem,
  NotificationItem,
  AuditEvent,
  DevelopmentPartner
} from '../types';

export const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde',
  'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Congo (DRC)',
  'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia',
  'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya',
  'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania',
  'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
  'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
  'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
  'Zambia', 'Zimbabwe'
];

export const DIRECTORATES: Directorate[] = [
  'Office of the CEO',
  'Strategic Planning, Resource Mobilization, M&E KM',
  'Agriculture, Food Security & Environmental Sustainability',
  'Economy, Infrastructure and Trade',
  'Human Capital and Institutional Development',
  'Operations',
  'Office of Science Technology and Innovation'
];

export const AFRICAN_REGIONS: AfricanRegion[] = [
  'West African Region',
  'East African Region',
  'Central African Region',
  'North African Region',
  'Southern African Region',
  'Continental'
];

export const STRATEGIC_RESULT_AREAS: StrategicResultArea[] = [
  'SRA 1 – Infrastructure and Industrialisation',
  'SRA 2 – Agriculture, Food Systems, Resilient Environment and Blue Economy',
  'SRA 3 – Education, Skills and Entrepreneurship',
  'SRA 4 – Health and Wellbeing',
  'SRA 5 – Institutional Development and Public Sector Governance'
];

export const STRATEGIC_DELIVERY_PATHWAYS: StrategicDeliveryPathway[] = [
  'SDP 1 – Inclusive National and Regional Implementation',
  'SDP 2 – Harnessing Data and Knowledge',
  'SDP 3 – Blended and Self-Reliant Development Financing',
  'SDP 4 – Utilizing RECs Platforms',
  'SDP 5 – Utilizing Science, Technology and Innovation'
];

export const INITIAL_DEVELOPMENT_PARTNERS: DevelopmentPartner[] = [
  {
    id: 'part-1',
    name: 'African Development Bank (AfDB)',
    shortName: 'AfDB',
    country: "Cote d'Ivoire",
    type: 'Multilateral Financial Institution',
    contactPerson: 'Dr. Kevin Kariuki',
    contactEmail: 'k.kariuki@afdb.org',
    contactPhone: '+225 20 26 39 00',
    focalArea: 'Continental Infrastructure, Clean Energy, Agricultural Value Chains & PIDA Flagships',
    totalCommitments: 120000000,
    status: 'Active',
    website: 'https://www.afdb.org',
    notes: 'Primary co-financing institutional partner for regional integration corridors and CAADP transformation.',
    dateAdded: '2024-01-15',
    lastUpdated: '2026-09-18'
  },
  {
    id: 'part-2',
    name: 'European Union (EU - Global Gateway)',
    shortName: 'EU',
    country: 'Belgium',
    type: 'Bilateral & Regional Development Partner',
    contactPerson: 'Ambassador Sandra Kramer',
    contactEmail: 'sandra.kramer@eeas.europa.eu',
    contactPhone: '+32 2 584 11 11',
    focalArea: 'Digital Connectivity, Strategic Transport Corridors, Green Transition & Governance',
    totalCommitments: 95000000,
    status: 'Active',
    website: 'https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/stronger-europe-world/global-gateway_en',
    notes: 'Multi-year envelope aligned with AU-EU Summit declarations and Africa-Europe Investment Package.',
    dateAdded: '2024-02-10',
    lastUpdated: '2026-08-25'
  },
  {
    id: 'part-3',
    name: 'World Bank Group (WBG)',
    shortName: 'WBG',
    country: 'United States',
    type: 'Multilateral Financial Institution',
    contactPerson: 'Victoria Kwakwa',
    contactEmail: 'vkwakwa@worldbank.org',
    contactPhone: '+1 202 473 1000',
    focalArea: 'Economic Integration, Trade Facilitation, Climate Resilience & Human Capital',
    totalCommitments: 150000000,
    status: 'Active',
    website: 'https://www.worldbank.org',
    notes: 'Major IDA concessionary credit provider supporting AfCFTA trade facilitation and cross-border grid interconnections.',
    dateAdded: '2024-01-20',
    lastUpdated: '2026-09-02'
  },
  {
    id: 'part-4',
    name: 'German Agency for International Cooperation (GIZ)',
    shortName: 'GIZ',
    country: 'Germany',
    type: 'Bilateral Agency',
    contactPerson: 'Dr. Hans-Peter Schadek',
    contactEmail: 'hans-peter.schadek@giz.de',
    contactPhone: '+49 228 4460 0',
    focalArea: 'Technical Vocational Training, Institutional Capacity Building & Pan-African Biosafety',
    totalCommitments: 45000000,
    status: 'Active',
    website: 'https://www.giz.de',
    notes: 'Technical assistance grant funding embedded directly within AUDA-NEPAD Directorates.',
    dateAdded: '2024-03-05',
    lastUpdated: '2026-07-14'
  },
  {
    id: 'part-5',
    name: 'Afreximbank',
    shortName: 'Afreximbank',
    country: 'Egypt',
    type: 'Pan-African Multilateral Bank',
    contactPerson: 'Denys Denya',
    contactEmail: 'ddenya@afreximbank.com',
    contactPhone: '+20 2 24564100',
    focalArea: 'Intra-African Trade Financing, PAPSS Implementation & Industrial Parks',
    totalCommitments: 85000000,
    status: 'Active',
    website: 'https://www.afreximbank.com',
    notes: 'Commercial trade guarantees and supply chain facilities supporting manufacturing clusters.',
    dateAdded: '2024-04-12',
    lastUpdated: '2026-09-10'
  },
  {
    id: 'part-6',
    name: 'Japan International Cooperation Agency (JICA)',
    shortName: 'JICA',
    country: 'Japan',
    type: 'Bilateral Agency',
    contactPerson: 'Ryuichi Kato',
    contactEmail: 'kato.ryuichi@jica.go.jp',
    contactPhone: '+81 3 5226 6660',
    focalArea: 'Corridor Development (OSBP), Agriculture (CARD initiative) & Health Systems',
    totalCommitments: 60000000,
    status: 'Active',
    website: 'https://www.jica.go.jp/english',
    notes: 'TICAD framework commitments emphasizing quality infrastructure and Kaizen productivity.',
    dateAdded: '2024-03-22',
    lastUpdated: '2026-08-30'
  },
  {
    id: 'part-7',
    name: 'United Nations Development Programme (UNDP)',
    shortName: 'UNDP',
    country: 'United States',
    type: 'UN Agency',
    contactPerson: 'Ahunna Eziakonwa',
    contactEmail: 'ahunna.eziakonwa@undp.org',
    contactPhone: '+1 212 906 5000',
    focalArea: 'SDG Localization, Youth Entrepreneurship (Timbuktoo Hubs) & Governance',
    totalCommitments: 40000000,
    status: 'Active',
    website: 'https://www.undp.org',
    notes: 'Joint AU-UNDP regional project agreements for innovation ecosystem and peace-development nexus.',
    dateAdded: '2024-02-18',
    lastUpdated: '2026-06-20'
  },
  {
    id: 'part-8',
    name: 'Arab Bank for Economic Development in Africa (BADEA)',
    shortName: 'BADEA',
    country: 'Saudi Arabia',
    type: 'Regional Financial Institution',
    contactPerson: 'Dr. Sidi Ould Tah',
    contactEmail: 'sidi.ouldtah@badea.org',
    contactPhone: '+966 11 464 1055',
    focalArea: 'Afro-Arab Economic Cooperation, Water Security, Rural Electrification & SME Lines',
    totalCommitments: 75000000,
    status: 'Active',
    website: 'https://www.badea.org',
    notes: 'Concessional blended debt instruments for Sub-Saharan infrastructure and post-harvest management.',
    dateAdded: '2024-05-01',
    lastUpdated: '2026-09-12'
  },
  {
    id: 'part-9',
    name: 'Agence Française de Développement (AFD)',
    shortName: 'AFD',
    country: 'France',
    type: 'Bilateral Agency',
    contactPerson: 'Bertrand Walckenaer',
    contactEmail: 'walckenaerb@afd.fr',
    contactPhone: '+33 1 53 44 31 31',
    focalArea: 'Biodiversity, Great Green Wall Restoration & Sovereign Green Bonds',
    totalCommitments: 55000000,
    status: 'Active',
    website: 'https://www.afd.fr/en',
    notes: 'Priority bilateral co-financier for Sahel climate mitigation and agro-ecological transition.',
    dateAdded: '2024-06-15',
    lastUpdated: '2026-08-10'
  },
  {
    id: 'part-10',
    name: 'Bill & Melinda Gates Foundation',
    shortName: 'BMGF',
    country: 'United States',
    type: 'Philanthropic Foundation',
    contactPerson: 'Cheikh Oumar Seydi',
    contactEmail: 'cheikh.seydi@gatesfoundation.org',
    contactPhone: '+1 206 709 3100',
    focalArea: 'Agricultural R&D, Pan-African Vaccine Manufacturing & Maternal Health',
    totalCommitments: 35000000,
    status: 'Prospective',
    website: 'https://www.gatesfoundation.org',
    notes: 'Strategic grant funding under discussion for AMRH (African Medicines Regulatory Harmonization).',
    dateAdded: '2024-08-01',
    lastUpdated: '2026-09-25'
  }
];

export const PARTNERS_DATABASE = INITIAL_DEVELOPMENT_PARTNERS.map((p) => ({
  id: p.id,
  name: p.name,
  country: p.country,
  type: p.type
}));

export const EXISTING_PROGRAMMES = [
  { id: 'prog-1', name: 'PIDA - Programme for Infrastructure Development in Africa' },
  { id: 'prog-2', name: 'CAADP - Comprehensive Africa Agriculture Development Programme' },
  { id: 'prog-3', name: 'AfCFTA Implementation Support Programme' },
  { id: 'prog-4', name: 'African Health Security and Epidemics Initiative' },
  { id: 'prog-5', name: 'Continental Artificial Intelligence & Science Hub' }
];

export const MOCK_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Dr. Amina Diallo',
    email: 'a.diallo@auda-nepad.org',
    role: 'System Administrator',
    directorate: 'Operations',
    title: 'Director of ICT & Governance',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-pm',
    name: 'Jean-Luc Nkurunziza',
    email: 'jl.nkurunziza@auda-nepad.org',
    role: 'Concept Owner / Project Manager',
    directorate: 'Agriculture, Food Security & Environmental Sustainability',
    title: 'Senior Agricultural Systems Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-director',
    name: 'Amb. Samuel Osei',
    email: 's.osei@auda-nepad.org',
    role: 'Directorate Director',
    directorate: 'Economy, Infrastructure and Trade',
    title: 'Director of Infrastructure & Trade',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-board',
    name: 'Prof. Fatima Al-Mansoor',
    email: 'f.almansoor@auda-nepad.org',
    role: 'Programme Board Member',
    directorate: 'Strategic Planning, Resource Mobilization, M&E KM',
    title: 'Chair, Continental Programme Board',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-ceo',
    name: 'Mrs. Nardos Bekele-Thomas',
    email: 'ceo.office@auda-nepad.org',
    role: 'CEO',
    directorate: 'Office of the CEO',
    title: 'Chief Executive Officer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-contracting',
    name: 'Elena Kouame',
    email: 'e.kouame@auda-nepad.org',
    role: 'Contracting Officer',
    directorate: 'Operations',
    title: 'Chief Contracting & Compliance Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-viewer',
    name: 'Tariq Mansour',
    email: 't.mansour@auda-nepad.org',
    role: 'Read-only Viewer',
    directorate: 'Strategic Planning, Resource Mobilization, M&E KM',
    title: 'Internal Audit & Risk Evaluator',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  }
];

export const MOCK_INITIATIVES: Initiative[] = [
  // 1. Concept in Draft
  {
    id: 'init-1',
    code: 'CON-2026-001',
    title: 'Sahelian Climate-Smart Livestock Corridors Initiative',
    classification: 'Programme',
    stage: 'Stage 0: Concept Development',
    stageCode: 0,
    status: 'Draft',
    directorate: 'Agriculture, Food Security & Environmental Sustainability',
    ownerId: 'usr-pm',
    ownerName: 'Jean-Luc Nkurunziza',
    dateSubmitted: '2026-09-18T10:00:00Z',
    lastUpdated: '2026-09-24T14:30:00Z',
    regions: ['West African Region', 'Central African Region'],
    countries: ['Mali', 'Niger', 'Burkina Faso', 'Chad', 'Senegal'],
    isContinental: false,
    existingProgramme: true,
    programmeName: 'CAADP - Comprehensive Africa Agriculture Development Programme',
    strategicObjective: 'Strengthen transhumance resilience, prevent pastoralist conflicts and deploy solar water points across 1,800km corridors.',
    implementationPeriod: '3–4 years',
    problemStatement: 'Severe desertification and water scarcity in the Sahel have intensified resource competition between pastoralist herders and settled crop farmers, driving recurring local conflicts and disrupting food security.',
    affectedParties: 'Over 4.2 million pastoralists, agropastoral communities, cross-border traders and local municipal authorities across 5 Sahel countries.',
    importanceStatement: 'Livestock accounts for 40% of agricultural GDP in the Sahel; stabilizing these migration corridors safeguards regional protein supply and prevents displacement.',
    consequencesOfInaction: 'Escalation of farmer-herder clashes, loss of livestock capital estimated at $340M annually, and acceleration of land degradation.',
    proposedIntervention: 'Establish GPS-mapped transhumance tracks with 120 climate-resilient solar boreholes, pasture reseeding, veterinary check stations and cross-border digital pastoral health certificates.',
    expectedBeneficiaries: '4.2 million community members, 12,000 pastoral households directly targeted, 85 local dispute resolution committees.',
    expectedResults: '65% reduction in cross-border pastoralist friction incidents, 120 functional solar water points, and established multi-country grazing accords.',
    estimatedCost: 28500000,
    currency: 'USD',
    possibleFundingPartners: ['African Development Bank (AfDB)', 'World Bank Group (WBG)'],
    fundingNotes: 'AfDB Climate Action Window and bilateral co-financing from GIZ.',
    sras: ['SRA 2 – Agriculture, Food Systems, Resilient Environment and Blue Economy'],
    sdps: ['SDP 1 – Inclusive National and Regional Implementation', 'SDP 4 – Utilizing RECs Platforms'],
    risks: [
      {
        id: 'rsk-101',
        riskId: 'RSK-SAH-01',
        description: 'Cross-border security instability in central Sahel corridors delaying borehole construction.',
        category: 'Political & Governance',
        severity: 'High',
        likelihood: 'High',
        impact: 'High',
        mitigationMeasures: 'Collaborate with G5 Sahel military escorts and establish community-led protection committees.',
        riskOwner: 'Jean-Luc Nkurunziza',
        targetDate: '2027-01-30',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-102',
        riskId: 'RSK-SAH-02',
        description: 'Groundwater aquifer salinity exceeding safe livestock consumption levels at planned drilling points.',
        category: 'Environmental & Social',
        severity: 'Medium',
        likelihood: 'Medium',
        impact: 'High',
        mitigationMeasures: 'Pre-drilling geophysical resistivity mapping and deploy solar nanofiltration desalination units.',
        riskOwner: 'Mariam Traore',
        targetDate: '2026-11-15',
        currentStatus: 'Active'
      }
    ],
    documents: [
      {
        id: 'doc-1',
        initiativeId: 'init-1',
        fileName: 'Sahel_Livestock_Concept_Draft_v1.pdf',
        fileType: 'PDF',
        fileSize: '3.4 MB',
        category: 'Concept Note',
        uploadedBy: 'Jean-Luc Nkurunziza',
        uploadDate: '2026-09-18T10:15:00Z',
        description: 'Initial concept draft incorporating ECOWAS pastoralist guidelines.',
        version: '1.0',
        confidentiality: 'Institutional Public'
      }
    ],
    transitions: [
      {
        id: 'trans-1',
        initiativeId: 'init-1',
        fromStage: 'Stage 0: Concept Development',
        toStage: 'Stage 0: Concept Development',
        fromStatus: 'Draft',
        toStatus: 'Draft',
        performedBy: 'Jean-Luc Nkurunziza',
        performerRole: 'Concept Owner / Project Manager',
        timestamp: '2026-09-18T10:00:00Z',
        decision: 'Concept Registration Created',
        comments: 'Initial draft saved. Compiling GIS mapping data for water points.'
      }
    ]
  },

  // 2. Concept Awaiting Board Evaluation
  {
    id: 'init-2',
    code: 'CON-2026-002',
    title: 'Pan-African Critical Mineral Value-Addition Battery Precursor Hub',
    classification: 'Programme',
    stage: 'Stage 1: Concept Evaluation',
    stageCode: 1,
    status: 'Submitted to Board',
    directorate: 'Economy, Infrastructure and Trade',
    ownerId: 'usr-director',
    ownerName: 'Amb. Samuel Osei',
    dateSubmitted: '2026-09-12T09:00:00Z',
    lastUpdated: '2026-09-20T11:00:00Z',
    regions: ['Central African Region', 'Southern African Region'],
    countries: ['Congo (DRC)', 'Zambia', 'Zimbabwe', 'Tanzania'],
    isContinental: false,
    existingProgramme: true,
    programmeName: 'PIDA - Programme for Infrastructure Development in Africa',
    strategicObjective: 'Establish two cross-border Special Economic Zones for lithium and cobalt refining into precursor cathode materials.',
    implementationPeriod: '4–5 years',
    problemStatement: 'Africa exports raw cobalt, lithium, and manganese at less than 5% of their refined value, forfeiting industrial jobs, tax revenues, and downstream clean-energy manufacturing integration.',
    affectedParties: 'Mining communities, national treasuries, regional industrial workforces, and continental manufacturing enterprises.',
    importanceStatement: 'Capturing only 20% of the EV battery precursor market generates over $45 billion in cumulative regional value by 2035.',
    consequencesOfInaction: 'Continued raw extraction with ecological degradation and total dependency on foreign refined battery components.',
    proposedIntervention: 'Develop hydro-powered processing facilities in DRC and Zambia, harmonize fiscal incentives, and institute shared cross-border trade corridors with clean logistics.',
    expectedBeneficiaries: '35,000 direct industrial jobs, 140,000 indirect supply chain livelihoods, and established sovereign mineral processing capability.',
    expectedResults: 'Two operational SEZ processing hubs producing 150,000 metric tons of battery precursor annually.',
    estimatedCost: 145000000,
    currency: 'USD',
    possibleFundingPartners: ['Afreximbank', 'African Development Bank (AfDB)', 'European Union (EU - Global Gateway)'],
    sras: ['SRA 1 – Infrastructure and Industrialisation'],
    sdps: ['SDP 1 – Inclusive National and Regional Implementation', 'SDP 3 – Blended and Self-Reliant Development Financing'],
    risks: [
      {
        id: 'rsk-201',
        riskId: 'RSK-BAT-01',
        description: 'Bilateral trade dispute or tariff re-imposition on intermediate unrefined cathode chemicals between DRC and Zambia.',
        category: 'Institutional',
        severity: 'High',
        likelihood: 'Medium',
        impact: 'High',
        mitigationMeasures: 'Legally binding Special Economic Zone treaty ratified by both sovereign parliaments.',
        riskOwner: 'Amb. Samuel Osei',
        targetDate: '2027-04-15',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-202',
        riskId: 'RSK-BAT-02',
        description: 'Volatile global lithium and cobalt spot prices lowering private co-investment returns.',
        category: 'Financial',
        severity: 'Medium',
        likelihood: 'High',
        impact: 'Medium',
        mitigationMeasures: 'Structured off-take long-term price collar contracts negotiated with tier-1 EV battery manufacturers.',
        riskOwner: 'Kofi Mensah',
        targetDate: '2026-12-30',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-203',
        riskId: 'RSK-BAT-03',
        description: 'Artisanal mining child labor allegations contaminating refinery traceability certification.',
        category: 'Environmental & Social',
        severity: 'High',
        likelihood: 'Low',
        impact: 'High',
        mitigationMeasures: 'Mandatory blockchain-enabled mineral provenance tagging and Fair Cobalt Alliance verification audits.',
        riskOwner: 'Dr. Amina Diallo',
        targetDate: '2027-02-28',
        currentStatus: 'Mitigated'
      }
    ],
    documents: [
      {
        id: 'doc-2',
        initiativeId: 'init-2',
        fileName: 'Battery_Precursor_SEZ_Feasibility_Brief.pdf',
        fileType: 'PDF',
        fileSize: '6.2 MB',
        category: 'Concept Note',
        uploadedBy: 'Amb. Samuel Osei',
        uploadDate: '2026-09-12T09:10:00Z',
        description: 'Feasibility brief with DRC-Zambia joint technical committee annex.',
        version: '1.2',
        confidentiality: 'Executive Confidential'
      }
    ],
    transitions: [
      {
        id: 'trans-2',
        initiativeId: 'init-2',
        fromStage: 'Stage 0: Concept Development',
        toStage: 'Stage 1: Concept Evaluation',
        fromStatus: 'Draft',
        toStatus: 'Submitted to Board',
        performedBy: 'Amb. Samuel Osei',
        performerRole: 'Directorate Director',
        timestamp: '2026-09-12T09:00:00Z',
        decision: 'Submitted to Programme Board',
        comments: 'Formally endorsed by Economy, Infrastructure and Trade Directorate for high-level board appraisal.'
      }
    ]
  },

  // 3. Concept Returned for Clarification
  {
    id: 'init-3',
    code: 'CON-2026-003',
    title: 'Digital Agritech & Satellite Soil Intelligence Platform',
    classification: 'Project',
    stage: 'Stage 1: Concept Evaluation',
    stageCode: 1,
    status: 'Returned for Clarification',
    directorate: 'Office of Science Technology and Innovation',
    ownerId: 'usr-pm',
    ownerName: 'Jean-Luc Nkurunziza',
    dateSubmitted: '2026-08-25T14:00:00Z',
    lastUpdated: '2026-09-22T16:00:00Z',
    regions: ['East African Region', 'Southern African Region'],
    countries: ['Kenya', 'Rwanda', 'Uganda', 'Malawi'],
    isContinental: false,
    existingProgramme: false,
    strategicObjective: 'Deploy AI-driven hyper-spectral soil analytics via mobile USSD to 500,000 smallholder farmers.',
    implementationPeriod: '2–3 years',
    problemStatement: 'Severe soil acidity and inappropriate fertilizer application reduce crop yields by up to 55% in East and Southern Africa, with traditional laboratory testing inaccessible to 95% of smallholders.',
    affectedParties: 'Smallholder maize, cassava, and legume farmers, national agricultural research institutes.',
    importanceStatement: 'Targeted micro-dosing guided by digital soil mapping boosts yields by 38% and cuts fertilizer expenditure by 22%.',
    consequencesOfInaction: 'Worsening chronic food deficits and depletion of arable topsoils.',
    proposedIntervention: 'Integrate open Copernicus satellite imagery with ground IoT sensors and distribute SMS/USSD advisory to farmers.',
    expectedBeneficiaries: '500,000 smallholder farm units, 60 regional agricultural extension hubs.',
    expectedResults: '500,000 farmers receiving localized soil fertility advice; 30% yield increase.',
    estimatedCost: 12400000,
    currency: 'USD',
    possibleFundingPartners: ['German Agency for International Cooperation (GIZ)', 'JICA'],
    sras: ['SRA 2 – Agriculture, Food Systems, Resilient Environment and Blue Economy'],
    sdps: ['SDP 2 – Harnessing Data and Knowledge', 'SDP 5 – Utilizing Science, Technology and Innovation'],
    documents: [
      {
        id: 'doc-3',
        initiativeId: 'init-3',
        fileName: 'Digital_Soil_Intelligence_Concept.pdf',
        fileType: 'PDF',
        fileSize: '4.1 MB',
        category: 'Concept Note',
        uploadedBy: 'Jean-Luc Nkurunziza',
        uploadDate: '2026-08-25T14:15:00Z',
        description: 'Concept note with cloud architecture schematics.',
        version: '1.0',
        confidentiality: 'Institutional Public'
      }
    ],
    transitions: [
      {
        id: 'trans-3a',
        initiativeId: 'init-3',
        fromStage: 'Stage 0: Concept Development',
        toStage: 'Stage 1: Concept Evaluation',
        fromStatus: 'Draft',
        toStatus: 'Submitted to Board',
        performedBy: 'Jean-Luc Nkurunziza',
        performerRole: 'Concept Owner / Project Manager',
        timestamp: '2026-08-25T14:00:00Z',
        decision: 'Submitted to Board',
        comments: 'Submitted for evaluation.'
      },
      {
        id: 'trans-3b',
        initiativeId: 'init-3',
        fromStage: 'Stage 1: Concept Evaluation',
        toStage: 'Stage 1: Concept Evaluation',
        fromStatus: 'Submitted to Board',
        toStatus: 'Returned for Clarification',
        performedBy: 'Prof. Fatima Al-Mansoor',
        performerRole: 'Programme Board Member',
        timestamp: '2026-09-08T15:30:00Z',
        decision: 'Returned for Clarification',
        comments: 'Clarify data sovereignty arrangements for national soil datasets and specify the subscription cost model post-donor grant.',
        deadline: '2026-10-05T00:00:00Z'
      }
    ]
  },

  // 4. Concept On Hold
  {
    id: 'init-4',
    code: 'CON-2026-004',
    title: 'Trans-Sahara High-Speed Green Freight Rail Feasibility',
    classification: 'Project',
    stage: 'Stage 1: Concept Evaluation',
    stageCode: 1,
    status: 'On Hold',
    directorate: 'Economy, Infrastructure and Trade',
    ownerId: 'usr-director',
    ownerName: 'Amb. Samuel Osei',
    dateSubmitted: '2026-07-15T11:00:00Z',
    lastUpdated: '2026-08-30T09:00:00Z',
    regions: ['North African Region', 'West African Region'],
    countries: ['Algeria', 'Niger', 'Nigeria'],
    isContinental: false,
    existingProgramme: true,
    programmeName: 'PIDA - Programme for Infrastructure Development in Africa',
    strategicObjective: 'Evaluate hydrogen-powered cross-desert freight rail connecting Algiers to Lagos.',
    implementationPeriod: '4–5 years',
    problemStatement: 'Overland transport between North Africa and West Africa relies on slow desert roads with prohibitive transit times exceeding 21 days.',
    affectedParties: 'Continental logistics operators, maritime ports, commercial cargo shippers.',
    importanceStatement: 'Accelerates AfCFTA trade flow between Mediterranean ports and the Gulf of Guinea.',
    consequencesOfInaction: 'Persistent fragmentation between Maghreb and ECOWAS economic zones.',
    proposedIntervention: 'Conduct engineering, green hydrogen fueling, and security feasibility study.',
    expectedBeneficiaries: 'Regional freight forwarders and 12 border economic zones.',
    expectedResults: 'Completed bankable feasibility study and environmental impact assessment.',
    estimatedCost: 18000000,
    currency: 'USD',
    possibleFundingPartners: ['African Development Bank (AfDB)', 'Arab Bank for Economic Development in Africa (BADEA)'],
    sras: ['SRA 1 – Infrastructure and Industrialisation'],
    sdps: ['SDP 1 – Inclusive National and Regional Implementation', 'SDP 3 – Blended and Self-Reliant Development Financing'],
    documents: [],
    transitions: [
      {
        id: 'trans-4',
        initiativeId: 'init-4',
        fromStage: 'Stage 1: Concept Evaluation',
        toStage: 'Stage 1: Concept Evaluation',
        fromStatus: 'Submitted to Board',
        toStatus: 'On Hold',
        performedBy: 'Prof. Fatima Al-Mansoor',
        performerRole: 'Programme Board Member',
        timestamp: '2026-08-30T09:00:00Z',
        decision: 'Put on Hold',
        comments: 'Awaiting completion of diplomatic transit protocols among corridor states. Scheduled for review in Q1 2027.'
      }
    ]
  },

  // 5. Concept Rejected
  {
    id: 'init-5',
    code: 'CON-2026-005',
    title: 'Commercial Luxury Eco-Resort Facility Fund',
    classification: 'Project',
    stage: 'Stage 1: Concept Evaluation',
    stageCode: 1,
    status: 'Rejected',
    directorate: 'Human Capital and Institutional Development',
    ownerId: 'usr-pm',
    ownerName: 'Jean-Luc Nkurunziza',
    dateSubmitted: '2026-06-10T10:00:00Z',
    lastUpdated: '2026-07-02T13:00:00Z',
    regions: ['East African Region'],
    countries: ['Seychelles', 'Mauritius', 'Kenya'],
    isContinental: false,
    existingProgramme: false,
    strategicObjective: 'Private hospitality venture fund for luxury ecotourism.',
    implementationPeriod: '2–3 years',
    problemStatement: 'Shortage of tier-1 private luxury eco-lodges in coastal wildlife reserves.',
    affectedParties: 'High-net-worth tourism travelers and international resort operators.',
    importanceStatement: 'High yield foreign exchange from luxury vacationers.',
    consequencesOfInaction: 'Private capital deployed to other continents.',
    proposedIntervention: 'Seed debt facility for boutique eco-hotel ventures.',
    expectedBeneficiaries: 'Resort developers and hospitality staff.',
    expectedResults: 'Five boutique resorts built.',
    estimatedCost: 22000000,
    currency: 'USD',
    possibleFundingPartners: ['Afreximbank'],
    sras: ['SRA 3 – Education, Skills and Entrepreneurship'],
    sdps: ['SDP 3 – Blended and Self-Reliant Development Financing'],
    documents: [],
    transitions: [
      {
        id: 'trans-5',
        initiativeId: 'init-5',
        fromStage: 'Stage 1: Concept Evaluation',
        toStage: 'Stage 1: Concept Evaluation',
        fromStatus: 'Submitted to Board',
        toStatus: 'Rejected',
        performedBy: 'Prof. Fatima Al-Mansoor',
        performerRole: 'Programme Board Member',
        timestamp: '2026-07-02T13:00:00Z',
        decision: 'Rejected',
        comments: 'Proposal does not align with AUDA-NEPAD public mandate or pro-poor development criteria. Purely commercial venture better served by private equity without public developmental subsidy.'
      }
    ]
  },

  // 6. Project Under Development (Stage 2)
  {
    id: 'init-6',
    code: 'PRJ-2026-001',
    title: 'Continental Early Warning & Vaccine Production Capacity Accelerator',
    classification: 'Programme',
    stage: 'Stage 2: Project Development',
    stageCode: 2,
    status: 'Under Development',
    directorate: 'Human Capital and Institutional Development',
    ownerId: 'usr-pm',
    ownerName: 'Jean-Luc Nkurunziza',
    projectManager: 'Dr. Chidi Okonkwo',
    dateSubmitted: '2026-08-01T08:00:00Z',
    lastUpdated: '2026-09-24T12:00:00Z',
    regions: ['Continental'],
    countries: ['South Africa', 'Senegal', 'Rwanda', 'Egypt', 'Kenya', 'Nigeria'],
    isContinental: true,
    existingProgramme: true,
    programmeName: 'African Health Security and Epidemics Initiative',
    strategicObjective: 'Advance African vaccine manufacturing from currently under 1% to 60% of domestic consumption by 2040.',
    implementationPeriod: '4–5 years',
    problemStatement: 'Africa imports 99% of its vaccines, leaving 1.4 billion people vulnerable to geopolitical supply hoarding during pandemics and recurring cholera, yellow fever and measles outbreaks.',
    affectedParties: 'Continental population, public health agencies, national immunization programs.',
    importanceStatement: 'Secures health sovereignty, prevents emergency panic purchasing, and saves billions in medical logistics.',
    consequencesOfInaction: 'Millions of preventable deaths during subsequent disease surges and perpetual dependency on donor benevolence.',
    proposedIntervention: 'Formulate regulatory harmonization via African Medicines Agency (AMA), provide technical assistance for GMP sterile fill-and-finish plants, and underwrite pooled procurement mechanisms.',
    expectedBeneficiaries: 'Over 800 million citizens across the continent; 4,500 specialized biopharmaceutical technicians.',
    expectedResults: 'Five operational WHO pre-qualified production facilities producing 200 million doses annually.',
    estimatedCost: 88500000,
    currency: 'USD',
    possibleFundingPartners: ['European Union (EU - Global Gateway)', 'World Bank Group (WBG)', 'African Development Bank (AfDB)'],
    sras: ['SRA 4 – Health and Wellbeing', 'SRA 5 – Institutional Development and Public Sector Governance'],
    sdps: ['SDP 1 – Inclusive National and Regional Implementation', 'SDP 5 – Utilizing Science, Technology and Innovation'],
    strategicAlignmentNarrative: 'Directly advances AU Agenda 2063 Aspiration 1 (A Prosperous Africa based on Inclusive Growth) and Goal 3 (Healthy and Well-Nourished Citizens), aligned with Africa CDC Partnerships for African Vaccine Manufacturing (PAVM).',
    theoryOfChangeEntries: [
      {
        id: 'toc-1',
        type: 'root_cause',
        description: 'Absence of unified continental regulatory approvals and fragmented national medicines authorities.',
        evidenceReference: 'WHO Africa Regulatory Assessment Report 2024',
        order: 1
      },
      {
        id: 'toc-2',
        type: 'core_problem',
        description: 'Insufficient domestic manufacturing of active pharmaceutical ingredients (APIs) and lack of off-take guarantee mechanisms.',
        evidenceReference: 'Africa CDC PAVM Framework 2023',
        order: 2
      },
      {
        id: 'toc-3',
        type: 'intervention',
        description: 'Establishment of African Medicines Agency (AMA) mutual recognition treaties and specialized biotechnology workforce fellowships.',
        evidenceReference: 'AUDA-NEPAD Health Science Division',
        order: 3
      },
      {
        id: 'toc-4',
        type: 'assumption',
        description: 'Member states ratify AMA treaty and enforce pooled regional public procurement agreements.',
        evidenceReference: 'AU Assembly Decision AHG/Dec.211',
        order: 4
      }
    ],
    risks: [
      {
        id: 'rsk-1',
        riskId: 'RSK-BIO-01',
        description: 'Delays in WHO pre-qualification certification for target manufacturing plants.',
        category: 'Operational',
        severity: 'High',
        likelihood: 'Medium',
        impact: 'High',
        mitigationMeasures: 'Deploy embedded WHO technical advisors and institute monthly compliance audits.',
        riskOwner: 'Dr. Chidi Okonkwo',
        targetDate: '2027-03-31',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-2',
        riskId: 'RSK-FIN-02',
        description: 'Fluctuation in currency exchange rates impacting imported bioreactor equipment procurement.',
        category: 'Financial',
        severity: 'Medium',
        likelihood: 'High',
        impact: 'Medium',
        mitigationMeasures: 'Denominate major capital contracts in EUR/USD with forward foreign exchange hedging.',
        riskOwner: 'Elena Kouame',
        targetDate: '2026-12-15',
        currentStatus: 'Active'
      }
    ],
    outcomes: [
      {
        id: 'out-1',
        outcomeNumber: 'Outcome 1',
        narrative: 'Enhanced institutional and regulatory capacity of the African Medicines Agency (AMA) and 6 National Regulatory Authorities.',
        assumptions: 'Political will maintained by signatory member states.',
        indicators: [
          {
            id: 'ind-1',
            indicatorNumber: 'IND-1.1',
            name: 'Number of NRAs reaching WHO Maturity Level 3',
            definition: 'National Regulatory Authorities achieving formal WHO Maturity Level 3 accreditation.',
            baselineValue: '2 NRAs',
            baselineDate: '2026-01-01',
            targetValue: '6 NRAs',
            targetDate: '2028-12-31',
            unitOfMeasurement: 'Agencies',
            dataSource: 'WHO Global Benchmarking Tool Reports',
            frequency: 'Annual',
            responsiblePerson: 'Dr. Chidi Okonkwo'
          }
        ],
        outputs: [
          {
            id: 'outp-1',
            outputNumber: 'Output 1.1',
            narrative: 'Harmonized continental dossier inspection guidelines adopted by 5 Regional Economic Communities.',
            target: '5 RECs',
            timeline: 'Q1 2027 - Q4 2027',
            responsiblePerson: 'Elena Kouame',
            activities: [
              {
                id: 'act-1',
                activityNumber: 'ACT-1.1.1',
                description: 'Continental technical consultative workshops with national drug inspectors.',
                leadPartner: 'World Bank Group (WBG)',
                target: '12 consultative sessions',
                startDate: '2027-01-15',
                endDate: '2027-11-30',
                timeline: '11 months',
                cost: 2400000,
                currency: 'USD',
                status: 'Planned'
              },
              {
                id: 'act-2',
                activityNumber: 'ACT-1.1.2',
                description: 'Digital platform development for joint regulatory dossier submissions.',
                leadPartner: 'European Union (EU - Global Gateway)',
                target: '1 unified digital portal',
                startDate: '2027-03-01',
                endDate: '2027-12-31',
                timeline: '10 months',
                cost: 3800000,
                currency: 'USD',
                status: 'Planned'
              }
            ]
          }
        ]
      }
    ],
    totalCalculatedBudget: 6200000,
    documents: [
      {
        id: 'doc-6',
        initiativeId: 'init-6',
        fileName: 'Vaccine_Accelerator_Full_Project_Doc.pdf',
        fileType: 'PDF',
        fileSize: '11.8 MB',
        category: 'Project Document',
        uploadedBy: 'Jean-Luc Nkurunziza',
        uploadDate: '2026-09-02T11:00:00Z',
        description: 'Comprehensive project document including results framework and risk matrix.',
        version: '2.0',
        confidentiality: 'Executive Confidential'
      }
    ],
    transitions: [
      {
        id: 'trans-6a',
        initiativeId: 'init-6',
        fromStage: 'Stage 0: Concept Development',
        toStage: 'Stage 1: Concept Evaluation',
        fromStatus: 'Draft',
        toStatus: 'Submitted to Board',
        performedBy: 'Jean-Luc Nkurunziza',
        performerRole: 'Concept Owner / Project Manager',
        timestamp: '2026-08-01T08:00:00Z',
        decision: 'Submitted to Board',
        comments: 'Concept submitted.'
      },
      {
        id: 'trans-6b',
        initiativeId: 'init-6',
        fromStage: 'Stage 1: Concept Evaluation',
        toStage: 'Stage 2: Project Development',
        fromStatus: 'Submitted to Board',
        toStatus: 'Approved for Development',
        performedBy: 'Prof. Fatima Al-Mansoor',
        performerRole: 'Programme Board Member',
        timestamp: '2026-08-18T14:00:00Z',
        decision: 'Endorsed for Project Development',
        comments: 'Strategic priority for continental health security. Ensure integration with Africa CDC PAVM initiatives.'
      }
    ]
  },

  // 7. Project Awaiting Appraisal (Stage 3)
  {
    id: 'init-7',
    code: 'PRJ-2026-002',
    title: 'Cross-Border Digital Payments Interoperability for AfCFTA MSMEs',
    classification: 'Project',
    stage: 'Stage 3: Project Appraisal',
    stageCode: 3,
    status: 'Submitted for Appraisal',
    directorate: 'Economy, Infrastructure and Trade',
    ownerId: 'usr-director',
    ownerName: 'Amb. Samuel Osei',
    projectManager: 'Kofi Mensah',
    dateSubmitted: '2026-07-20T10:00:00Z',
    lastUpdated: '2026-09-21T09:00:00Z',
    regions: ['West African Region', 'East African Region'],
    countries: ['Ghana', 'Nigeria', 'Kenya', 'Rwanda', 'Cote d\'Ivoire'],
    isContinental: false,
    existingProgramme: true,
    programmeName: 'AfCFTA Implementation Support Programme',
    strategicObjective: 'Enable instant low-cost local currency cross-border settlements for informal cross-border traders and MSMEs.',
    implementationPeriod: '3–4 years',
    problemStatement: 'MSMEs in Africa lose up to 14% of transaction value in multi-currency conversion fees and correspondent bank delays when trading across neighboring African borders.',
    affectedParties: 'Over 12 million informal cross-border traders (70% women), fintech switches, commercial banks.',
    importanceStatement: 'Directly eliminates hard currency bottlenecks and cuts settlement settlement time from days to under 30 seconds.',
    consequencesOfInaction: 'Informal smuggling persists and AfCFTA tariff concessions fail to reach small grassroots traders.',
    proposedIntervention: 'Integrate the Pan-African Payment and Settlement System (PAPSS) with national mobile money wallets and commercial fintech gateways.',
    expectedBeneficiaries: '3.5 million verified MSME merchants, 50 participating commercial banks, 18 mobile money operators.',
    expectedResults: 'Annual cross-border settlement volume of $4.2B with average transaction fee under 1.5%.',
    estimatedCost: 34000000,
    currency: 'USD',
    possibleFundingPartners: ['Afreximbank', 'African Development Bank (AfDB)'],
    sras: ['SRA 1 – Infrastructure and Industrialisation', 'SRA 5 – Institutional Development and Public Sector Governance'],
    sdps: ['SDP 2 – Harnessing Data and Knowledge', 'SDP 3 – Blended and Self-Reliant Development Financing'],
    totalCalculatedBudget: 34000000,
    risks: [
      {
        id: 'rsk-701',
        riskId: 'RSK-FIN-10',
        description: 'Foreign exchange liquidity shortages in participant central banks causing temporary settlement queuing.',
        category: 'Financial',
        severity: 'High',
        likelihood: 'Medium',
        impact: 'High',
        mitigationMeasures: 'Afreximbank $3B foreign exchange liquidity backstop facility guarantee.',
        riskOwner: 'Kofi Mensah',
        targetDate: '2026-12-31',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-702',
        riskId: 'RSK-OPS-11',
        description: 'Cybersecurity vulnerability or distributed denial-of-service (DDoS) attack on central switch infrastructure.',
        category: 'Operational',
        severity: 'High',
        likelihood: 'Low',
        impact: 'High',
        mitigationMeasures: 'ISO 27001 certified geo-redundant disaster recovery site with real-time AI intrusion detection.',
        riskOwner: 'Dr. Amina Diallo',
        targetDate: '2027-02-15',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-703',
        riskId: 'RSK-POL-12',
        description: 'Reluctance of private telecommunication operators to integrate proprietary mobile wallets with open PAPSS APIs.',
        category: 'Political & Governance',
        severity: 'Medium',
        likelihood: 'Medium',
        impact: 'Medium',
        mitigationMeasures: 'Central Bank regulatory mandates compelling national interoperability for cross-border transactions.',
        riskOwner: 'Amb. Samuel Osei',
        targetDate: '2026-11-30',
        currentStatus: 'Mitigated'
      }
    ],
    boardAppraisal: {
      appraisalId: 'APP-2026-002',
      submittedDate: '2026-09-15T10:00:00Z',
      ratings: [
        {
          criteriaId: 'crit-1',
          criteriaName: 'Strategic alignment',
          rating: 'Meets requirements',
          score: 20,
          maxScore: 20,
          evidence: 'Directly accelerates AfCFTA implementation and local currency liquidity retention.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-2',
          criteriaName: 'Programme design principles',
          rating: 'Meets requirements',
          score: 18,
          maxScore: 20,
          evidence: 'Architecture built on open API protocols with proven PAPSS rails.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-3',
          criteriaName: 'Portfolio coherence and integration',
          rating: 'Meets requirements',
          score: 15,
          maxScore: 15,
          evidence: 'Complements existing trade facilitation corridors in ECOWAS and EAC.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-4',
          criteriaName: 'Budget allocation',
          rating: 'Partially meets requirements',
          score: 12,
          maxScore: 15,
          evidence: 'Fintech technical assistance budget is slightly oversized relative to hardware switch costs.',
          requiredAction: 'Provide granular breakdown of API integration software license fees.',
          responsiblePerson: 'Kofi Mensah',
          status: 'Pending Action'
        },
        {
          criteriaId: 'crit-5',
          criteriaName: 'Partnerships',
          rating: 'Meets requirements',
          score: 15,
          maxScore: 15,
          evidence: 'Afreximbank and national central banks firmly committed with letters of intent.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-6',
          criteriaName: 'Risk management',
          rating: 'Meets requirements',
          score: 14,
          maxScore: 15,
          evidence: 'Comprehensive AML/CFT compliance framework embedded.',
          status: 'Reviewed'
        }
      ],
      overallComment: 'Outstanding initiative with immediate high economic multiplier. Board requests refined cost breakdown for software licenses before CEO recommendation.',
      evidenceAdvice: 'Ensure close coordination with Central Banks to avoid parallel duplicate sandbox efforts.',
      conditions: ['Submit audited API licensing quote', 'Formalize Central Bank data-sharing MoU'],
      requiredRevisions: ['Refine Output 2.2 budget schedule'],
      recommendation: 'Recommended with Conditions',
      appraisedByBoard: ['Prof. Fatima Al-Mansoor', 'Amb. Samuel Osei']
    },
    documents: [
      {
        id: 'doc-7a',
        initiativeId: 'init-7',
        fileName: 'AfCFTA_PAPSS_Endorsed_Concept_Note.pdf',
        fileType: 'PDF',
        fileSize: '4.2 MB',
        category: 'Concept Note',
        uploadedBy: 'Amb. Samuel Osei',
        uploadDate: '2026-07-20T10:30:00Z',
        description: 'Original Stage 0 Concept Note endorsed by Directorate of Trade & Industry with AfCFTA Secretariat annex.',
        version: '1.0',
        confidentiality: 'Institutional Public'
      },
      {
        id: 'doc-7b',
        initiativeId: 'init-7',
        fileName: 'PAPSS_CrossBorder_MSME_Feasibility_Study.pdf',
        fileType: 'PDF',
        fileSize: '12.8 MB',
        category: 'Project Document',
        uploadedBy: 'Kofi Mensah',
        uploadDate: '2026-08-30T11:15:00Z',
        description: 'Comprehensive financial feasibility, multi-currency settlement clearing rules, and national switch API readiness report.',
        version: '1.2',
        confidentiality: 'Internal Restrictive'
      },
      {
        id: 'doc-7',
        initiativeId: 'init-7',
        fileName: 'PAPSS_MSME_Integration_Appraisal_Dossier.pdf',
        fileType: 'PDF',
        fileSize: '8.4 MB',
        category: 'Appraisal Report',
        uploadedBy: 'Amb. Samuel Osei',
        uploadDate: '2026-09-15T14:00:00Z',
        description: 'Complete appraisal dossier, risk mitigation agreements, and board evaluation scorecards.',
        version: '2.0',
        confidentiality: 'Executive Confidential'
      }
    ],
    transitions: [
      {
        id: 'trans-7',
        initiativeId: 'init-7',
        fromStage: 'Stage 2: Project Development',
        toStage: 'Stage 3: Project Appraisal',
        fromStatus: 'Under Development',
        toStatus: 'Submitted for Appraisal',
        performedBy: 'Amb. Samuel Osei',
        performerRole: 'Directorate Director',
        timestamp: '2026-09-15T10:00:00Z',
        decision: 'Submitted for Board Appraisal',
        comments: 'Project development completed; results framework validated.'
      }
    ]
  },

  // 8. Project Awaiting CEO Approval (Stage 4)
  {
    id: 'init-8',
    code: 'PRJ-2026-003',
    title: 'Great Green Wall Agro-Forestry & Solar Microgrid Clusters',
    classification: 'Programme',
    stage: 'Stage 4: Project Approval',
    stageCode: 4,
    status: 'Awaiting CEO Decision',
    directorate: 'Agriculture, Food Security & Environmental Sustainability',
    ownerId: 'usr-pm',
    ownerName: 'Jean-Luc Nkurunziza',
    projectManager: 'Mariam Traore',
    dateSubmitted: '2026-06-15T09:00:00Z',
    lastUpdated: '2026-09-23T11:00:00Z',
    regions: ['West African Region', 'East African Region'],
    countries: ['Senegal', 'Mali', 'Niger', 'Chad', 'Sudan', 'Djibouti'],
    isContinental: false,
    existingProgramme: true,
    programmeName: 'CAADP - Comprehensive Africa Agriculture Development Programme',
    strategicObjective: 'Restore 2.5 million hectares of degraded land with resilient agro-forestry integrated with off-grid productive solar energy.',
    implementationPeriod: '4–5 years',
    problemStatement: 'Desert encroachment across the Sahel swallows 100,000 hectares annually, leaving millions impoverished and triggering southward migration.',
    affectedParties: '7.5 million rural villagers, female agricultural cooperatives, local forest management unions.',
    importanceStatement: 'Directly sequestrates 18M tons of carbon while generating diversified incomes through gum arabic, shea butter, and solar-irrigated vegetable gardens.',
    consequencesOfInaction: 'Loss of fertile soil, famine risk, and uncontrolled climate-induced migration waves.',
    proposedIntervention: 'Community-led ecological restoration, distributed 50kW solar irrigation mini-grids, and decentralized cold storage units.',
    expectedBeneficiaries: '7.5 million people, 45,000 women organized into agro-processing cooperatives.',
    expectedResults: '2.5 million hectares restored; 350 operational solar mini-grids; $52M new agricultural cooperative revenue.',
    estimatedCost: 75000000,
    currency: 'USD',
    possibleFundingPartners: ['World Bank Group (WBG)', 'African Development Bank (AfDB)', 'European Union (EU - Global Gateway)'],
    sras: ['SRA 2 – Agriculture, Food Systems, Resilient Environment and Blue Economy', 'SRA 1 – Infrastructure and Industrialisation'],
    sdps: ['SDP 1 – Inclusive National and Regional Implementation', 'SDP 3 – Blended and Self-Reliant Development Financing'],
    totalCalculatedBudget: 75000000,
    risks: [
      {
        id: 'rsk-801',
        riskId: 'RSK-ENV-20',
        description: 'Severe multi-year drought causing sapling mortality rates above 40% in newly planted green corridors.',
        category: 'Environmental & Social',
        severity: 'High',
        likelihood: 'High',
        impact: 'High',
        mitigationMeasures: 'Deploy deep-root drought-resistant acacia senegal species and solar drip irrigation systems.',
        riskOwner: 'Mariam Traore',
        targetDate: '2027-05-30',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-802',
        riskId: 'RSK-OPS-21',
        description: 'Vandalism or theft of solar panels and battery storage units at remote community mini-grid sites.',
        category: 'Operational',
        severity: 'Medium',
        likelihood: 'Medium',
        impact: 'Medium',
        mitigationMeasures: 'Community ownership co-op model with anti-theft GPS tracking and secure perimeter enclosures.',
        riskOwner: 'Jean-Luc Nkurunziza',
        targetDate: '2026-10-31',
        currentStatus: 'Mitigated'
      },
      {
        id: 'rsk-803',
        riskId: 'RSK-INS-22',
        description: 'Coordination friction across 6 national environment ministries slowing multilateral fund disbursement.',
        category: 'Institutional',
        severity: 'Medium',
        likelihood: 'Medium',
        impact: 'Low',
        mitigationMeasures: 'Empower AUDA-NEPAD regional liaison desk with quarterly statutory ministerial steering meetings.',
        riskOwner: 'Prof. Fatima Al-Mansoor',
        targetDate: '2026-12-15',
        currentStatus: 'Active'
      }
    ],
    boardAppraisal: {
      appraisalId: 'APP-2026-003',
      submittedDate: '2026-09-01T11:00:00Z',
      completedDate: '2026-09-18T16:00:00Z',
      ratings: [
        {
          criteriaId: 'crit-1',
          criteriaName: 'Strategic alignment',
          rating: 'Meets requirements',
          score: 20,
          maxScore: 20,
          evidence: 'Perfect alignment with AU Agenda 2063, Paris Climate Agreement, and Great Green Wall Decade of Action.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-2',
          criteriaName: 'Programme design principles',
          rating: 'Meets requirements',
          score: 19,
          maxScore: 20,
          evidence: 'Community ownership model prevents tree mortality observed in earlier top-down initiatives.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-3',
          criteriaName: 'Portfolio coherence and integration',
          rating: 'Meets requirements',
          score: 15,
          maxScore: 15,
          evidence: 'Synergistic with Sahelian pastoral corridors and solar energy master plans.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-4',
          criteriaName: 'Budget allocation',
          rating: 'Meets requirements',
          score: 14,
          maxScore: 15,
          evidence: 'Co-funding confirmed by AfDB Africa Climate Window ($45M) and World Bank ($30M).',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-5',
          criteriaName: 'Partnerships',
          rating: 'Meets requirements',
          score: 15,
          maxScore: 15,
          evidence: 'Letters of endorsement signed by all 6 environment ministers.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-6',
          criteriaName: 'Risk management',
          rating: 'Meets requirements',
          score: 14,
          maxScore: 15,
          evidence: 'Security risk protocol includes local community scouts and remote satellite verification.',
          status: 'Reviewed'
        }
      ],
      overallComment: 'Consolidated Board Appraisal confirms unanimous recommendation for formal CEO Approval. The project demonstrates exceptional community-anchored sustainability, strong climate finance commitments, and inter-state coherence.',
      evidenceAdvice: 'Ensure the Executive Office issues directives for high-level signing ceremonies at the upcoming AU Summit.',
      conditions: [
        'Finalize environmental and social management framework (ESMF) clearance with AfDB',
        'Establish independent M&E third-party satellite verification protocol'
      ],
      requiredRevisions: [],
      recommendation: 'Recommended for Approval',
      appraisedByBoard: ['Prof. Fatima Al-Mansoor', 'Amb. Samuel Osei', 'Dr. Amina Diallo']
    },
    documents: [
      {
        id: 'doc-8',
        initiativeId: 'init-8',
        fileName: 'Great_Green_Wall_Board_Appraisal_Signed.pdf',
        fileType: 'PDF',
        fileSize: '5.2 MB',
        category: 'Appraisal Report',
        uploadedBy: 'Prof. Fatima Al-Mansoor',
        uploadDate: '2026-09-18T16:30:00Z',
        description: 'Final appraisal and recommendation transmittal to the CEO.',
        version: '1.0',
        confidentiality: 'Executive Confidential'
      }
    ],
    transitions: [
      {
        id: 'trans-8',
        initiativeId: 'init-8',
        fromStage: 'Stage 3: Project Appraisal',
        toStage: 'Stage 4: Project Approval',
        fromStatus: 'Recommended for Approval',
        toStatus: 'Awaiting CEO Decision',
        performedBy: 'Prof. Fatima Al-Mansoor',
        performerRole: 'Programme Board Member',
        timestamp: '2026-09-18T17:00:00Z',
        decision: 'Transmitted to CEO for Formal Approval',
        comments: 'Unanimous Board endorsement submitted for final CEO sanction.'
      }
    ]
  },

  // 9. Project 2 Awaiting CEO Approval (Stage 4)
  {
    id: 'init-9',
    code: 'PRJ-2026-004',
    title: 'Continental Science, Technology and AI Innovation Centers of Excellence',
    classification: 'Programme',
    stage: 'Stage 4: Project Approval',
    stageCode: 4,
    status: 'Awaiting CEO Decision',
    directorate: 'Office of Science Technology and Innovation',
    ownerId: 'usr-pm',
    ownerName: 'Jean-Luc Nkurunziza',
    projectManager: 'Prof. Adebayo Ogunlesi',
    dateSubmitted: '2026-05-10T09:00:00Z',
    lastUpdated: '2026-09-22T14:00:00Z',
    regions: ['Continental'],
    countries: ['Nigeria', 'Kenya', 'South Africa', 'Tunisia', 'Senegal'],
    isContinental: true,
    existingProgramme: true,
    programmeName: 'Continental Artificial Intelligence & Science Hub',
    strategicObjective: 'Anchor 5 regional AI compute clusters, fund 1,000 doctoral AI researcher fellowships, and establish ethical AI guidelines.',
    implementationPeriod: '4–5 years',
    problemStatement: 'Africa represents less than 1% of global computing power and artificial intelligence patent generation, threatening severe technological exclusion.',
    affectedParties: 'Universities, technology startups, public research institutions, youth tech innovators.',
    importanceStatement: 'Positions the continent to build sovereign Large Language Models in African indigenous languages and retain top technical talent.',
    consequencesOfInaction: 'Complete technological dependency, severe brain drain of AI specialists, and algorithmic bias against African populations.',
    proposedIntervention: 'Equip five host universities with GPU compute clusters, provide doctoral scholarships, and sponsor open-source Pan-African datasets.',
    expectedBeneficiaries: '1,000 doctoral researchers, 500 AI spin-off startups, 50,000 software engineers trained.',
    expectedResults: 'Five functional GPU compute clusters; 1,000 completed PhD fellowships; 20 open-source African language foundation models.',
    estimatedCost: 52000000,
    currency: 'USD',
    possibleFundingPartners: ['European Union (EU - Global Gateway)', 'German Agency for International Cooperation (GIZ)', 'JICA'],
    sras: ['SRA 3 – Education, Skills and Entrepreneurship', 'SRA 5 – Institutional Development and Public Sector Governance'],
    sdps: ['SDP 2 – Harnessing Data and Knowledge', 'SDP 5 – Utilizing Science, Technology and Innovation'],
    totalCalculatedBudget: 52000000,
    boardAppraisal: {
      appraisalId: 'APP-2026-004',
      submittedDate: '2026-08-20T10:00:00Z',
      completedDate: '2026-09-19T11:00:00Z',
      ratings: [
        {
          criteriaId: 'crit-1',
          criteriaName: 'Strategic alignment',
          rating: 'Meets requirements',
          score: 20,
          maxScore: 20,
          evidence: 'Fully aligned with the AU Continental Artificial Intelligence Strategy adopted in 2024.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-2',
          criteriaName: 'Programme design principles',
          rating: 'Meets requirements',
          score: 18,
          maxScore: 20,
          evidence: 'Equitable regional distribution across North, South, East, West and Central Africa.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-3',
          criteriaName: 'Portfolio coherence and integration',
          rating: 'Meets requirements',
          score: 15,
          maxScore: 15,
          evidence: 'Synergistic with digital agriculture, health diagnostics and fintech pipelines.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-4',
          criteriaName: 'Budget allocation',
          rating: 'Meets requirements',
          score: 14,
          maxScore: 15,
          evidence: '60% capital allocation into compute hardware, 40% into human capital and fellowships.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-5',
          criteriaName: 'Partnerships',
          rating: 'Meets requirements',
          score: 15,
          maxScore: 15,
          evidence: 'EU Global Gateway and African universities signed bilateral operational MOUs.',
          status: 'Reviewed'
        },
        {
          criteriaId: 'crit-6',
          criteriaName: 'Risk management',
          rating: 'Meets requirements',
          score: 14,
          maxScore: 15,
          evidence: 'High reliability green power solutions included for all data center sites.',
          status: 'Reviewed'
        }
      ],
      overallComment: 'Program Board strongly recommends for CEO approval. High transformative impact for youth employment and digital sovereignty.',
      evidenceAdvice: 'Recommend fast-tracking the procurement of high-performance GPU clusters to mitigate global semiconductor lead-times.',
      conditions: ['Establish pan-African ethical AI review board prior to tranche 2'],
      requiredRevisions: [],
      recommendation: 'Recommended for Approval',
      appraisedByBoard: ['Prof. Fatima Al-Mansoor', 'Amb. Samuel Osei']
    },
    documents: [
      {
        id: 'doc-9',
        initiativeId: 'init-9',
        fileName: 'AI_Centers_Excellence_Appraisal_Board_Clearance.pdf',
        fileType: 'PDF',
        fileSize: '7.1 MB',
        category: 'Appraisal Report',
        uploadedBy: 'Prof. Fatima Al-Mansoor',
        uploadDate: '2026-09-19T11:30:00Z',
        description: 'Clearance report submitted to the Office of the CEO.',
        version: '1.0',
        confidentiality: 'Internal Restrictive'
      }
    ],
    transitions: [
      {
        id: 'trans-9',
        initiativeId: 'init-9',
        fromStage: 'Stage 3: Project Appraisal',
        toStage: 'Stage 4: Project Approval',
        fromStatus: 'Recommended for Approval',
        toStatus: 'Awaiting CEO Decision',
        performedBy: 'Prof. Fatima Al-Mansoor',
        performerRole: 'Programme Board Member',
        timestamp: '2026-09-19T12:00:00Z',
        decision: 'Transmitted to CEO for Formal Approval',
        comments: 'Recommended for approval. Ready for executive decree.'
      }
    ]
  },

  // 10. Approved Project Under Contracting (Stage 5)
  {
    id: 'init-10',
    code: 'PRJ-2026-005',
    title: 'Northern Corridor Green Freight Logistics & Dry Port Modernization',
    classification: 'Programme',
    stage: 'Stage 5: Contracting',
    stageCode: 5,
    status: 'Under Contracting',
    directorate: 'Economy, Infrastructure and Trade',
    ownerId: 'usr-director',
    ownerName: 'Amb. Samuel Osei',
    projectManager: 'Grace Mwangi',
    dateSubmitted: '2026-03-10T10:00:00Z',
    lastUpdated: '2026-09-23T16:00:00Z',
    regions: ['East African Region'],
    countries: ['Kenya', 'Uganda', 'Rwanda', 'South Sudan'],
    isContinental: false,
    existingProgramme: true,
    programmeName: 'PIDA - Programme for Infrastructure Development in Africa',
    strategicObjective: 'Decongest the Mombasa-Kigali transport corridor, reduce border transit dwell times from 72 hours to 6 hours, and electrify cargo terminals.',
    implementationPeriod: '4–5 years',
    problemStatement: 'East African landlocked countries face excessive transport costs representing 40% of import value due to bottlenecks along the Northern Corridor.',
    affectedParties: 'Manufacturers, logistics firms, customs authorities, consumer markets in Uganda, Rwanda, and South Sudan.',
    importanceStatement: 'Lowering corridor freight tariffs by 25% directly increases regional GDP and competitiveness under the AfCFTA.',
    consequencesOfInaction: 'Continued highway congestion, high carbon emissions from aging diesel truck fleets, and high prices for everyday consumer essentials.',
    proposedIntervention: 'Digitize single customs window, construct solar cold storage hubs at Malaba border dry port, and deploy EV fleet charging infrastructure.',
    expectedBeneficiaries: '120 million people in East Africa; 2,500 logistics companies; 18 customs border stations.',
    expectedResults: 'Dwell time cut to under 6 hours; transport logistics costs reduced by 22%; carbon emissions down 18%.',
    estimatedCost: 96000000,
    currency: 'USD',
    possibleFundingPartners: ['African Development Bank (AfDB)', 'Japan International Cooperation Agency (JICA)'],
    sras: ['SRA 1 – Infrastructure and Industrialisation'],
    sdps: ['SDP 1 – Inclusive National and Regional Implementation', 'SDP 3 – Blended and Self-Reliant Development Financing'],
    totalCalculatedBudget: 96000000,
    risks: [
      {
        id: 'rsk-1001',
        riskId: 'RSK-INF-30',
        description: 'Border customs IT system outages at Malaba causing freight queuing exceeding 48 hours.',
        category: 'Operational',
        severity: 'High',
        likelihood: 'Medium',
        impact: 'High',
        mitigationMeasures: 'Deploy fiber-backed offline caching servers and 24/7 dedicated rapid-response ICT engineering team.',
        riskOwner: 'Grace Mwangi',
        targetDate: '2026-11-20',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-1002',
        riskId: 'RSK-POL-31',
        description: 'Disputes over standardized axle-load limit enforcement between Kenya and Uganda revenue authorities.',
        category: 'Political & Governance',
        severity: 'Medium',
        likelihood: 'Low',
        impact: 'High',
        mitigationMeasures: 'East African Community (EAC) harmonized axle-load legal framework ratified with automated weigh-in-motion sensors.',
        riskOwner: 'Amb. Samuel Osei',
        targetDate: '2027-01-15',
        currentStatus: 'Mitigated'
      },
      {
        id: 'rsk-1003',
        riskId: 'RSK-FIN-32',
        description: 'Inflation in imported steel and solar component prices impacting border dry port construction budget.',
        category: 'Financial',
        severity: 'Low',
        likelihood: 'Medium',
        impact: 'Low',
        mitigationMeasures: 'Fixed-price lump sum EPC contracts with 10% contingency allocation reserves.',
        riskOwner: 'Elena Kouame',
        targetDate: '2026-09-30',
        currentStatus: 'Closed'
      }
    ],
    boardAppraisal: {
      appraisalId: 'APP-2026-005',
      submittedDate: '2026-06-10T10:00:00Z',
      completedDate: '2026-07-01T15:00:00Z',
      ratings: [],
      overallComment: 'Appraisal completed with high scores.',
      evidenceAdvice: 'Prioritize dry port land titling.',
      conditions: [],
      requiredRevisions: [],
      recommendation: 'Recommended for Approval',
      appraisedByBoard: ['Prof. Fatima Al-Mansoor']
    },
    ceoApproval: {
      referenceNumber: 'AUDA-PROJ-2026-005',
      decisionDate: '2026-07-25T14:30:00Z',
      decision: 'Formally Approved',
      ceoName: 'Mrs. Nardos Bekele-Thomas',
      guidanceText: 'Approved in full. Ensure swift transition to contracting. Ensure procurement follows joint harmonized AU/AfDB standards to guarantee transparency and speed.'
    },
    financingAgreement: {
      id: 'fa-1',
      reference: 'FA-AUDA-AFDB-2026-09',
      instrument: 'Non-reimbursable grant',
      grantAmount: 96000000,
      currency: 'USD',
      procurementStandard: 'Joint Harmonized Standards',
      auditCadence: 'Quarterly',
      reportingCadence: 'Quarterly',
      counterpartFunding: 12000000,
      agreementDate: '2026-08-15',
      startDate: '2026-10-01',
      endDate: '2030-09-30',
      implementingPartner: 'Northern Corridor Transit and Transport Coordination Authority (NCTTCA)',
      focalPerson: 'Elena Kouame',
      conditions: 'Establishment of multi-state project steering committee and environmental license approvals.',
      tranches: [
        {
          id: 'tr-1',
          trancheNumber: 1,
          trancheName: 'Inception & Detailed Engineering Designs',
          percentage: 20,
          amount: 19200000,
          preconditionMilestone: 'Signing of Bilateral MoU with Kenya Ports Authority and Uganda Revenue Authority',
          targetDate: '2026-10-15',
          status: 'Eligible',
          responsiblePerson: 'Elena Kouame',
          notes: 'Preconditions verified by Legal Counsel.'
        },
        {
          id: 'tr-2',
          trancheNumber: 2,
          trancheName: 'Civil Works & Border Dry Port Modernization',
          percentage: 45,
          amount: 43200000,
          preconditionMilestone: 'Completion of 60% Malaba solar dry port civil construction',
          targetDate: '2027-11-30',
          status: 'Pending Pre-condition',
          responsiblePerson: 'Grace Mwangi'
        },
        {
          id: 'tr-3',
          trancheNumber: 3,
          trancheName: 'Single Window Digital Systems & Final Handover',
          percentage: 35,
          amount: 33600000,
          preconditionMilestone: 'Deployment of single window customs automation and commercial operation',
          targetDate: '2029-06-30',
          status: 'Pending Pre-condition',
          responsiblePerson: 'Elena Kouame'
        }
      ]
    },
    negotiations: [
      {
        id: 'neg-1',
        partner: 'African Development Bank (AfDB)',
        date: '2026-08-10',
        participants: 'Elena Kouame (AUDA-NEPAD), Marcelle Dupont (AfDB Infrastructure Lead), Amb. Samuel Osei',
        topic: 'Financing Instrument and Special Procurement Protocols',
        summary: 'Agreed on utilizing Joint Harmonized Standards. Counterpart funding of $12M pledged across 3 member state budgets.',
        issuesRaised: 'Tariff exemptions on imported electrical terminal equipment.',
        decisionsMade: 'AfDB agreed to include tax exemption clauses in Section 4.2 of the Financing Agreement.',
        actionsRequired: 'Legal counsel to finalize clause 4.2 wording.',
        responsiblePerson: 'Elena Kouame',
        dueDate: '2026-08-20',
        status: 'Resolved'
      }
    ],
    mous: [
      {
        id: 'mou-1',
        referenceNumber: 'MOU-AUDA-NCTTCA-2026-01',
        title: 'Memorandum of Understanding on Northern Corridor Modernization',
        partner: 'Northern Corridor Transit Authority (NCTTCA)',
        partnerCountry: 'Kenya / Uganda / Rwanda',
        signingParties: 'AUDA-NEPAD CEO & NCTTCA Executive Secretary',
        signingDate: '2026-08-05',
        effectiveDate: '2026-08-10',
        expiryDate: '2031-08-09',
        scope: 'Technical coordination, land allocation for solar dry ports, joint monitoring.',
        status: 'Signed'
      }
    ],
    documents: [
      {
        id: 'doc-10a',
        initiativeId: 'init-10',
        fileName: 'AUDA_PROJ_2026_005_CEO_Approval_Signed.pdf',
        fileType: 'PDF',
        fileSize: '2.1 MB',
        category: 'CEO Directive',
        uploadedBy: 'Mrs. Nardos Bekele-Thomas',
        uploadDate: '2026-07-25T15:00:00Z',
        description: 'Official CEO Approval Warrant.',
        version: '1.0',
        confidentiality: 'Institutional Public'
      },
      {
        id: 'doc-10b',
        initiativeId: 'init-10',
        fileName: 'AfDB_Grant_Financing_Agreement_Master.pdf',
        fileType: 'PDF',
        fileSize: '9.4 MB',
        category: 'Financing Agreement',
        uploadedBy: 'Elena Kouame',
        uploadDate: '2026-08-16T11:00:00Z',
        description: 'Executed Master Financing Agreement and disbursement schedule.',
        version: '1.0',
        confidentiality: 'Executive Confidential'
      }
    ],
    transitions: [
      {
        id: 'trans-10a',
        initiativeId: 'init-10',
        fromStage: 'Stage 4: Project Approval',
        toStage: 'Stage 5: Contracting',
        fromStatus: 'Approved',
        toStatus: 'Under Contracting',
        performedBy: 'Mrs. Nardos Bekele-Thomas',
        performerRole: 'CEO',
        timestamp: '2026-07-25T14:30:00Z',
        decision: 'Approved and Transferred to Contracting Office',
        comments: 'Formally approved. Proceed with bilateral agreements.'
      }
    ]
  },

  // 11. Approved Project in Active Contracting (Stage 5)
  {
    id: 'init-11',
    code: 'PRJ-2026-006',
    title: 'Southern Africa SADC Renewable Energy & Regional Power Interconnector',
    classification: 'Programme',
    stage: 'Stage 5: Contracting',
    stageCode: 5,
    status: 'Financing Finalized',
    directorate: 'Economy, Infrastructure and Trade',
    ownerId: 'usr-director',
    ownerName: 'Amb. Samuel Osei',
    projectManager: 'Sipho Ndlovu',
    dateSubmitted: '2026-02-14T09:00:00Z',
    lastUpdated: '2026-09-24T15:00:00Z',
    regions: ['Southern African Region'],
    countries: ['South Africa', 'Mozambique', 'Zambia', 'Zimbabwe', 'Botswana'],
    isContinental: false,
    existingProgramme: true,
    programmeName: 'PIDA - Programme for Infrastructure Development in Africa',
    strategicObjective: 'Transmit 2,000MW of solar and wind renewable power across the Southern African Power Pool (SAPP).',
    implementationPeriod: '4–5 years',
    problemStatement: 'Severe load-shedding and reliance on aging thermal coal plants stifle manufacturing growth in Southern Africa.',
    affectedParties: 'Over 85 million residents, mining conglomerates, industrial manufacturing clusters.',
    importanceStatement: 'Eliminates power deficits, lowers kilowatt costs by 30%, and prevents 12 million tons of carbon emissions annually.',
    consequencesOfInaction: 'Widespread economic stagnation and industrial plant closures due to power unreliability.',
    proposedIntervention: 'Erect high-voltage DC transmission interconnectors, build regional battery energy storage systems (BESS), and automate power trading dispatch.',
    expectedBeneficiaries: '85 million consumers, 12,000 industrial facilities.',
    expectedResults: '2,000MW wheeling capacity; zero unserved load in connected hubs.',
    estimatedCost: 210000000,
    currency: 'USD',
    possibleFundingPartners: ['World Bank Group (WBG)', 'African Development Bank (AfDB)', 'European Union (EU - Global Gateway)'],
    sras: ['SRA 1 – Infrastructure and Industrialisation'],
    sdps: ['SDP 1 – Inclusive National and Regional Implementation', 'SDP 3 – Blended and Self-Reliant Development Financing'],
    totalCalculatedBudget: 210000000,
    risks: [
      {
        id: 'rsk-1101',
        riskId: 'RSK-ENG-40',
        description: 'Grid synchronization failure between Southern African Power Pool (SAPP) member utilities during high renewable feed-in.',
        category: 'Operational',
        severity: 'High',
        likelihood: 'Low',
        impact: 'High',
        mitigationMeasures: 'Install dynamic STATCOM voltage stabilization systems and automated synchronous condensers.',
        riskOwner: 'Sipho Ndlovu',
        targetDate: '2027-08-30',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-1102',
        riskId: 'RSK-FIN-41',
        description: 'Sovereign off-taker credit downgrade risk affecting long-term power purchase agreement (PPA) bankability.',
        category: 'Financial',
        severity: 'High',
        likelihood: 'High',
        impact: 'High',
        mitigationMeasures: 'World Bank Multilateral Investment Guarantee Agency (MIGA) political risk insurance and escrow liquidity accounts.',
        riskOwner: 'Elena Kouame',
        targetDate: '2026-12-01',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-1103',
        riskId: 'RSK-ENV-42',
        description: 'High-voltage transmission line crossing designated bird migration flyways and wildlife migratory corridors.',
        category: 'Environmental & Social',
        severity: 'Low',
        likelihood: 'Low',
        impact: 'Low',
        mitigationMeasures: 'Bird diverter reflectors installed and rerouted away from sensitive national park buffers.',
        riskOwner: 'Dr. Amina Diallo',
        targetDate: '2026-08-15',
        currentStatus: 'Closed'
      }
    ],
    boardAppraisal: {
      appraisalId: 'APP-2026-006',
      submittedDate: '2026-05-15T09:00:00Z',
      completedDate: '2026-06-05T14:00:00Z',
      ratings: [],
      overallComment: 'Strategic infrastructure flagship.',
      evidenceAdvice: 'Coordinate closely with SADC Energy Ministers.',
      conditions: [],
      requiredRevisions: [],
      recommendation: 'Recommended for Approval',
      appraisedByBoard: ['Prof. Fatima Al-Mansoor']
    },
    ceoApproval: {
      referenceNumber: 'AUDA-PROJ-2026-006',
      decisionDate: '2026-06-20T11:00:00Z',
      decision: 'Formally Approved',
      ceoName: 'Mrs. Nardos Bekele-Thomas',
      guidanceText: 'Approved unconditionally. Top tier continental priority under PIDA.'
    },
    financingAgreement: {
      id: 'fa-2',
      reference: 'FA-AUDA-WB-2026-14',
      instrument: 'Blended financing facility',
      grantAmount: 210000000,
      currency: 'USD',
      procurementStandard: 'Joint Harmonized Standards',
      auditCadence: 'Biannually',
      reportingCadence: 'Quarterly',
      counterpartFunding: 35000000,
      agreementDate: '2026-07-28',
      startDate: '2026-09-01',
      endDate: '2031-08-31',
      implementingPartner: 'Southern African Power Pool (SAPP Coordination Centre)',
      focalPerson: 'Elena Kouame',
      conditions: 'National regulatory clearances for cross-border wheeling tariffs.',
      tranches: [
        {
          id: 'tr-201',
          trancheNumber: 1,
          trancheName: 'Mobilization & Technical Specifications',
          percentage: 15,
          amount: 31500000,
          preconditionMilestone: 'Establishment of SAPP Joint Coordination Office and Procurement Board',
          targetDate: '2026-09-15',
          actualDisbursementDate: '2026-09-20',
          status: 'Disbursed',
          responsiblePerson: 'Elena Kouame'
        },
        {
          id: 'tr-202',
          trancheNumber: 2,
          trancheName: 'Transmission Towers & Substation EPC Procurement',
          percentage: 50,
          amount: 105000000,
          preconditionMilestone: 'Award of major EPC transmission line contract',
          targetDate: '2027-06-30',
          status: 'Pending Pre-condition',
          responsiblePerson: 'Sipho Ndlovu'
        }
      ]
    },
    documents: [
      {
        id: 'doc-11',
        initiativeId: 'init-11',
        fileName: 'SADC_Power_Interconnector_Financing_Instrument.pdf',
        fileType: 'PDF',
        fileSize: '14.2 MB',
        category: 'Financing Agreement',
        uploadedBy: 'Elena Kouame',
        uploadDate: '2026-07-29T10:00:00Z',
        description: 'Blended facility term sheet executed with World Bank and AfDB.',
        version: '1.0',
        confidentiality: 'Executive Confidential'
      }
    ],
    transitions: [
      {
        id: 'trans-11',
        initiativeId: 'init-11',
        fromStage: 'Stage 4: Project Approval',
        toStage: 'Stage 5: Contracting',
        fromStatus: 'Approved',
        toStatus: 'Financing Finalized',
        performedBy: 'Elena Kouame',
        performerRole: 'Contracting Officer',
        timestamp: '2026-07-28T16:00:00Z',
        decision: 'Financing Executed & Tranche 1 Cleared',
        comments: 'All conditions precedent met; Tranche 1 disbursed.'
      }
    ]
  },

  // 12. Approved Project in Amendment Stage (Stage 6)
  {
    id: 'init-12',
    code: 'PRJ-2025-014',
    title: 'Central African Rainforest Preservation & Carbon Credit Cooperative',
    classification: 'Programme',
    stage: 'Stage 6: Amendment and Change Control',
    stageCode: 6,
    status: 'Approved',
    directorate: 'Agriculture, Food Security & Environmental Sustainability',
    ownerId: 'usr-pm',
    ownerName: 'Jean-Luc Nkurunziza',
    projectManager: 'Patrice Ondoa',
    dateSubmitted: '2025-11-10T10:00:00Z',
    lastUpdated: '2026-09-24T08:00:00Z',
    regions: ['Central African Region'],
    countries: ['Cameroon', 'Gabon', 'Congo', 'Central African Republic'],
    isContinental: false,
    existingProgramme: true,
    programmeName: 'CAADP - Comprehensive Africa Agriculture Development Programme',
    strategicObjective: 'Protect Congo Basin rainforest carbon sinks and channel sovereign carbon credit dividends directly to indigenous forest custodians.',
    implementationPeriod: '4–5 years',
    problemStatement: 'Unregulated commercial logging threatens the second lung of the planet, while indigenous communities lack revenue alternatives.',
    affectedParties: 'Over 2.8 million forest-dwelling indigenous peoples, national forestry directorates.',
    importanceStatement: 'The Congo Basin absorbs 1.5 billion tons of CO2 annually; preserving it is essential to global climate equilibrium.',
    consequencesOfInaction: 'Accelerating deforestation tipping point resulting in severe climate disruption across Central and Southern Africa.',
    proposedIntervention: 'Establish high-integrity sovereign carbon crediting mechanism, deploy satellite LiDAR forest canopy monitoring, and fund indigenous community micro-enterprises.',
    expectedBeneficiaries: '2.8 million community members, 80 indigenous forest protection cooperatives.',
    expectedResults: '40 million hectares conserved; $120M in voluntary carbon market sales channeled to communities.',
    estimatedCost: 65000000,
    currency: 'USD',
    possibleFundingPartners: ['German Agency for International Cooperation (GIZ)', 'European Union (EU - Global Gateway)', 'World Bank Group (WBG)'],
    sras: ['SRA 2 – Agriculture, Food Systems, Resilient Environment and Blue Economy'],
    sdps: ['SDP 1 – Inclusive National and Regional Implementation', 'SDP 3 – Blended and Self-Reliant Development Financing'],
    totalCalculatedBudget: 65000000,
    risks: [
      {
        id: 'rsk-1201',
        riskId: 'RSK-CAR-50',
        description: 'Global voluntary carbon market volatility reducing credit verification price per metric ton below break-even threshold.',
        category: 'Financial',
        severity: 'Medium',
        likelihood: 'High',
        impact: 'Medium',
        mitigationMeasures: 'Forward off-take purchase commitments secured at guaranteed floor price of $15/ton with European compliance buyers.',
        riskOwner: 'Patrice Ondoa',
        targetDate: '2027-03-31',
        currentStatus: 'Active'
      },
      {
        id: 'rsk-1202',
        riskId: 'RSK-INS-51',
        description: 'Disputed benefit-sharing mechanisms between national treasury and indigenous customary forest landholders.',
        category: 'Institutional',
        severity: 'High',
        likelihood: 'Medium',
        impact: 'High',
        mitigationMeasures: 'Statutory escrow cooperative accounts managed with multi-signature biometric community council keys.',
        riskOwner: 'Patrice Ondoa',
        targetDate: '2026-11-15',
        currentStatus: 'Active'
      }
    ],
    ceoApproval: {
      referenceNumber: 'AUDA-PROJ-2025-014',
      decisionDate: '2026-01-14T10:00:00Z',
      decision: 'Formally Approved',
      ceoName: 'Mrs. Nardos Bekele-Thomas',
      guidanceText: 'Approved. Ensure high governance integrity on carbon market revenues.'
    },
    amendments: [
      {
        id: 'amend-1',
        amendmentId: 'AMD-2026-001',
        initiativeId: 'init-12',
        versionNumber: 'v1.1',
        changeType: 'Scope',
        description: 'Expand project boundary to incorporate additional 5 million hectares in eastern Gabon and integrate acoustic biodiversity monitoring sensors.',
        reason: 'Gabon government enacted new sovereign biodiversity law and co-allocated $6M in state counterpart co-financing.',
        requestedBy: 'Patrice Ondoa',
        dateRequested: '2026-09-05',
        approvalStatus: 'Pending Review',
        originalValue: '40M hectares protected; budget $65M',
        proposedValue: '45M hectares protected; budget increased to $71M ($6M Gabon co-funding)',
        budgetImpact: '+$6,000,000 (funded 100% by sovereign counterpart)',
        timelineImpact: 'No extension required'
      }
    ],
    documents: [
      {
        id: 'doc-12',
        initiativeId: 'init-12',
        fileName: 'Amendment_Request_AMD_2026_001.pdf',
        fileType: 'PDF',
        fileSize: '3.9 MB',
        category: 'Amendment Request',
        uploadedBy: 'Patrice Ondoa',
        uploadDate: '2026-09-05T14:00:00Z',
        description: 'Formal amendment proposal with Gabon Ministry of Environment agreement.',
        version: '1.1',
        confidentiality: 'Internal Restrictive'
      }
    ],
    transitions: [
      {
        id: 'trans-12',
        initiativeId: 'init-12',
        fromStage: 'Stage 5: Contracting',
        toStage: 'Stage 6: Amendment and Change Control',
        fromStatus: 'Approved',
        toStatus: 'Approved',
        performedBy: 'Jean-Luc Nkurunziza',
        performerRole: 'Concept Owner / Project Manager',
        timestamp: '2026-09-05T14:30:00Z',
        decision: 'Amendment Request Initiated',
        comments: 'Submitted controlled scope amendment for Program Board and CEO review.'
      }
    ]
  }
];

export const MOCK_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Review and evaluate Sahelian Climate-Smart Livestock Corridors concept',
    initiativeId: 'init-1',
    initiativeTitle: 'Sahelian Climate-Smart Livestock Corridors Initiative',
    stage: 'Stage 0: Concept Development',
    assignedToRole: 'Concept Owner / Project Manager',
    assignedToName: 'Jean-Luc Nkurunziza',
    assignedBy: 'Dr. Amina Diallo',
    dueDate: '2026-09-30',
    priority: 'Medium',
    status: 'In Progress',
    actionType: 'Clarify Concept'
  },
  {
    id: 'tsk-2',
    title: 'Conduct Program Board evaluation on Battery Precursor Hub proposal',
    initiativeId: 'init-2',
    initiativeTitle: 'Pan-African Critical Mineral Value-Addition Battery Precursor Hub',
    stage: 'Stage 1: Concept Evaluation',
    assignedToRole: 'Programme Board Member',
    assignedToName: 'Prof. Fatima Al-Mansoor',
    assignedBy: 'Amb. Samuel Osei',
    dueDate: '2026-09-28',
    priority: 'Critical',
    status: 'Pending',
    actionType: 'Board Evaluation'
  },
  {
    id: 'tsk-3',
    title: 'Respond to Program Board clarification notes on Digital Agritech',
    initiativeId: 'init-3',
    initiativeTitle: 'Digital Agritech & Satellite Soil Intelligence Platform',
    stage: 'Stage 1: Concept Evaluation',
    assignedToRole: 'Concept Owner / Project Manager',
    assignedToName: 'Jean-Luc Nkurunziza',
    assignedBy: 'Prof. Fatima Al-Mansoor',
    dueDate: '2026-10-05',
    priority: 'High',
    status: 'In Progress',
    actionType: 'Clarify Concept'
  },
  {
    id: 'tsk-4',
    title: 'Finalize Results Framework & Budget rollup for Vaccine Accelerator',
    initiativeId: 'init-6',
    initiativeTitle: 'Continental Early Warning & Vaccine Production Capacity Accelerator',
    stage: 'Stage 2: Project Development',
    assignedToRole: 'Concept Owner / Project Manager',
    assignedToName: 'Jean-Luc Nkurunziza',
    assignedBy: 'Dr. Chidi Okonkwo',
    dueDate: '2026-10-02',
    priority: 'High',
    status: 'In Progress',
    actionType: 'Appraise Project'
  },
  {
    id: 'tsk-5',
    title: 'Complete Board appraisal synthesis for Digital Payments project',
    initiativeId: 'init-7',
    initiativeTitle: 'Cross-Border Digital Payments Interoperability for AfCFTA MSMEs',
    stage: 'Stage 3: Project Appraisal',
    assignedToRole: 'Programme Board Member',
    assignedToName: 'Prof. Fatima Al-Mansoor',
    assignedBy: 'Amb. Samuel Osei',
    dueDate: '2026-09-29',
    priority: 'Critical',
    status: 'Pending',
    actionType: 'Appraise Project'
  },
  {
    id: 'tsk-6',
    title: 'Review and sign CEO Approval for Great Green Wall project',
    initiativeId: 'init-8',
    initiativeTitle: 'Great Green Wall Agro-Forestry & Solar Microgrid Clusters',
    stage: 'Stage 4: Project Approval',
    assignedToRole: 'CEO',
    assignedToName: 'Mrs. Nardos Bekele-Thomas',
    assignedBy: 'Prof. Fatima Al-Mansoor',
    dueDate: '2026-09-27',
    priority: 'Critical',
    status: 'Pending',
    actionType: 'CEO Decision'
  },
  {
    id: 'tsk-7',
    title: 'Review and sign CEO Approval for AI Centers of Excellence project',
    initiativeId: 'init-9',
    initiativeTitle: 'Continental Science, Technology and AI Innovation Centers of Excellence',
    stage: 'Stage 4: Project Approval',
    assignedToRole: 'CEO',
    assignedToName: 'Mrs. Nardos Bekele-Thomas',
    assignedBy: 'Prof. Fatima Al-Mansoor',
    dueDate: '2026-09-28',
    priority: 'High',
    status: 'Pending',
    actionType: 'CEO Decision'
  },
  {
    id: 'tsk-8',
    title: 'Verify conditions precedent for Tranche 2 of Northern Corridor',
    initiativeId: 'init-10',
    initiativeTitle: 'Northern Corridor Green Freight Logistics & Dry Port Modernization',
    stage: 'Stage 5: Contracting',
    assignedToRole: 'Contracting Officer',
    assignedToName: 'Elena Kouame',
    assignedBy: 'Amb. Samuel Osei',
    dueDate: '2026-10-15',
    priority: 'Medium',
    status: 'Pending',
    actionType: 'Contracting Action'
  },
  {
    id: 'tsk-9',
    title: 'Conduct Board Appraisal on Rainforest Preservation Scope Amendment',
    initiativeId: 'init-12',
    initiativeTitle: 'Central African Rainforest Preservation & Carbon Credit Cooperative',
    stage: 'Stage 6: Amendment and Change Control',
    assignedToRole: 'Programme Board Member',
    assignedToName: 'Prof. Fatima Al-Mansoor',
    assignedBy: 'Jean-Luc Nkurunziza',
    dueDate: '2026-10-08',
    priority: 'Medium',
    status: 'Pending',
    actionType: 'Review Amendment'
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Project Awaiting CEO Approval',
    message: 'Great Green Wall Agro-Forestry project was unanimously recommended by Program Board and awaits your formal decree.',
    timestamp: '2026-09-24T18:30:00Z',
    read: false,
    priority: 'urgent',
    relatedId: 'init-8',
    stage: 'Stage 4: Project Approval'
  },
  {
    id: 'notif-2',
    title: 'Board Appraisal Transmitted',
    message: 'AI Innovation Centers of Excellence (PRJ-2026-004) appraisal packet has been finalized for executive review.',
    timestamp: '2026-09-24T14:15:00Z',
    read: false,
    priority: 'urgent',
    relatedId: 'init-9',
    stage: 'Stage 4: Project Approval'
  },
  {
    id: 'notif-3',
    title: 'Clarification Required on Concept',
    message: 'Program Board requested clarification on data sovereignty for Digital Agritech & Soil Intelligence (CON-2026-003). Due by Oct 5.',
    timestamp: '2026-09-23T11:00:00Z',
    read: true,
    priority: 'warning',
    relatedId: 'init-3',
    stage: 'Stage 1: Concept Evaluation'
  },
  {
    id: 'notif-4',
    title: 'Contracting Milestone Met',
    message: 'Tranche 1 ($31.5M) for SADC Renewable Energy Interconnector successfully disbursed by World Bank facility.',
    timestamp: '2026-09-21T09:45:00Z',
    read: true,
    priority: 'success',
    relatedId: 'init-11',
    stage: 'Stage 5: Contracting'
  },
  {
    id: 'notif-5',
    title: 'Amendment Request Lodged',
    message: 'Project PRJ-2025-014 has lodged an amendment for scope expansion with Gabon counterpart co-funding.',
    timestamp: '2026-09-20T16:20:00Z',
    read: true,
    priority: 'info',
    relatedId: 'init-12',
    stage: 'Stage 6: Amendment and Change Control'
  }
];

export const MOCK_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-24T18:30:00Z',
    entityType: 'CEO Approval',
    entityId: 'init-8',
    entityTitle: 'Great Green Wall Agro-Forestry & Solar Microgrid Clusters',
    action: 'Dossier Received by CEO Desk',
    user: 'Prof. Fatima Al-Mansoor',
    userRole: 'Programme Board Member',
    oldValue: 'Stage 3: Project Appraisal',
    newValue: 'Stage 4: Project Approval',
    comment: 'Transmitted with unanimous Board recommendation for formal approval.'
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-24T15:00:00Z',
    entityType: 'Contracting',
    entityId: 'init-11',
    entityTitle: 'Southern Africa SADC Renewable Energy & Regional Power Interconnector',
    action: 'Tranche Disbursed',
    user: 'Elena Kouame',
    userRole: 'Contracting Officer',
    oldValue: 'Eligible',
    newValue: 'Disbursed',
    comment: 'First tranche of $31,500,000 disbursed following verification of SAPP coordination office setup.'
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-23T11:00:00Z',
    entityType: 'Concept',
    entityId: 'init-3',
    entityTitle: 'Digital Agritech & Satellite Soil Intelligence Platform',
    action: 'Workflow Returned',
    user: 'Prof. Fatima Al-Mansoor',
    userRole: 'Programme Board Member',
    oldValue: 'Submitted to Board',
    newValue: 'Returned for Clarification',
    comment: 'Board requested data sovereignty protocols and sustainability plan.'
  },
  {
    id: 'aud-4',
    timestamp: '2026-09-22T09:30:00Z',
    entityType: 'Appraisal',
    entityId: 'init-7',
    entityTitle: 'Cross-Border Digital Payments Interoperability for AfCFTA MSMEs',
    action: 'Criteria Scored',
    user: 'Amb. Samuel Osei',
    userRole: 'Directorate Director',
    comment: 'Appraisal ratings completed for Strategic Alignment, Design Principles, and Risk Management.'
  },
  {
    id: 'aud-5',
    timestamp: '2026-09-18T10:00:00Z',
    entityType: 'Concept',
    entityId: 'init-1',
    entityTitle: 'Sahelian Climate-Smart Livestock Corridors Initiative',
    action: 'Record Created',
    user: 'Jean-Luc Nkurunziza',
    userRole: 'Concept Owner / Project Manager',
    newValue: 'Draft',
    comment: 'Initial concept registered under CAADP alignment.'
  }
];
