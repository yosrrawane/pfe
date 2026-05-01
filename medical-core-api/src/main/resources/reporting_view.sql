-- SQL Script for Power BI Reporting
-- Run this in pgAdmin or via psql

CREATE OR REPLACE VIEW v_pbi_reporting AS
SELECT 
    a.id as analysis_id,
    a.date_analyse as observation_date,
    a.score_confiance_global as ai_confidence,
    a.statut_validation as status,
    a.a_ete_corrige as was_corrected,
    a.pathologie_finale as final_diagnosis,
    p.nom as detected_pathology,
    p.probabilite as pathology_probability,
    CASE 
        WHEN a.statut_validation = 'VALIDE' THEN 100
        WHEN a.statut_validation = 'CORRIGE' THEN 50
        WHEN a.statut_validation = 'REJETE' THEN 0
        ELSE NULL
    END as accuracy_score
FROM 
    analyses a
LEFT JOIN 
    pathologie p ON a.id = p.analyse_id;

COMMENT ON VIEW v_pbi_reporting IS 'Simplified view for Oxalia Power BI Reporting';
