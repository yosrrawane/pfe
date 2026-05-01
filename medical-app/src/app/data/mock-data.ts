import { User, Role } from '../models/user.model';
import { Analyse } from '../models/analyse.model';

export const MOCK_USERS: User[] = [
  { id: '1', nom: 'Admin', prenom: 'Super', email: 'admin@medapp.com', role: Role.ADMIN, isActive: true },
  { id: '2', nom: 'Dupont', prenom: 'Jean', email: 'medecin@medapp.com', role: Role.MEDECIN, isActive: true },
  { id: '3', nom: 'Martin', prenom: 'Sophie', email: 'tech@medapp.com', role: Role.TECHNICIEN, isActive: true }
];

export const MOCK_ANALYSES: Analyse[] = [
  {
    id: 'A001',
    technicienId: '3',
    dateAnalyse: new Date('2023-11-10T10:30:00'),
    imageScannerUrl: 'assets/scanners/scan1.jpg',
    pathologies: [
      { nom: 'Pneumonie', probabilite: 85 },
      { nom: 'Nodule Pulmonaire', probabilite: 40 }
    ],
    scoreConfianceGlobal: 88,
    rapport: "Examen tomodensitométrique thoracique mettant en évidence des foyers de condensation alvéolaire bilatéraux avec bronchogramme aérique (pneumonie probable à 85%).",
    statutValidation: 'EN_ATTENTE'
  },
  {
    id: 'A002',
    technicienId: '3',
    dateAnalyse: new Date('2023-11-08T14:15:00'),
    imageScannerUrl: null as any,
    pathologies: [
      { nom: 'Emphysème', probabilite: 92 },
      { nom: 'Pneumothorax', probabilite: 15 }
    ],
    scoreConfianceGlobal: 95,
    rapport: "Hyperclarté diffuse des champs pulmonaires traduisant un emphysème centrolobulaire sévère (92%). Absence d'épanchement pleural significatif.",
    statutValidation: 'VALIDE',
    medecinId: '2',
    dateValidation: new Date('2023-11-09T09:00:00'),
    commentaireMedecin: "Concordant avec la clinique du patient (BPCO connue)."
  }
];
