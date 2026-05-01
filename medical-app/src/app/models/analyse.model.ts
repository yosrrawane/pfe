export interface Pathologie {
  nom: string;
  probabilite: number; // entre 0 et 100
}

export interface ExamenClinique {
  id?: string;
  observations: string;
  dateValidation: Date;
  
  // Nouveaux champs
  toux?: boolean;
  fievre?: boolean;
  douleurThoracique?: boolean;
  auscultation?: string;
  anomaliesRespiratoires?: string;
  signesCliniques?: string;
}

export interface Analyse {
  id: string;
  technicienId: string;
  dateAnalyse: Date;
  
  // Patient Info
  patientId: string;
  age: number;
  sexe: 'Homme' | 'Femme';
  poids?: number;
  taille?: number;
  antecedents?: string;

  imageFaceUrl: string;
  imageProfilUrl: string;

  // Résultats IA (Oxalia)
  pathologies: Pathologie[];
  scoreConfianceGlobal: number;
  heatmapBase64?: string;

  // Rapport généré par IA
  rapport: string;

  // Workflow RaaS (Validation)
  statutValidation: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'CORRIGE';
  medecinId?: string;
  dateValidation?: Date;
  commentaireMedecin?: string; // Optionnel

  examenClinique?: ExamenClinique;

  // Correction Doctor
  rapportCorrige?: string;
  pathologieFinale?: string;
  aEteCorrige?: boolean;
}
