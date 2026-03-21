-- Mock Data for Exam Preparation Platform
-- Run after schema.sql

-- Insert Professions
INSERT INTO professions (id, name, description, display_order, is_active)
VALUES 
    ('p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Student', 'Currently enrolled in education', 1, TRUE),
    ('p2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Doctor', 'Medical professional or physician', 2, TRUE),
    ('p3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Nurse', 'Healthcare nursing professional', 3, TRUE),
    ('p4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Engineer', 'Engineering professional', 4, TRUE),
    ('p5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Teacher', 'Education professional', 5, TRUE),
    ('p6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'Accountant', 'Financial accounting professional', 6, TRUE),
    ('p7eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'IT Professional', 'Information technology professional', 7, TRUE),
    ('p8eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'Lawyer', 'Legal professional', 8, TRUE),
    ('p9eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'Business Professional', 'Business and management professional', 9, TRUE),
    ('p10eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Other', 'Other profession', 10, TRUE);

-- Insert Sectors
INSERT INTO sectors (id, name, description, display_order, is_active)
VALUES 
    ('s1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Education', 'Educational exams and certifications', 1, TRUE),
    ('s2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Health', 'Healthcare and medical exams', 2, TRUE),
    ('s3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Technology', 'Technology and IT certifications', 3, TRUE),
    ('s4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Finance', 'Finance and accounting certifications', 4, TRUE),
    ('s5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Law', 'Legal and bar examinations', 5, TRUE),
    ('s6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'Business', 'Business and management certifications', 6, TRUE);

-- Insert Exam Types
INSERT INTO exam_types (id, name, description, sector_id, display_order, is_active)
VALUES 
    -- Education Sector
    ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'WAEC', 'West African Examinations Council', 's1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 1, TRUE),
    ('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'NECO', 'National Examinations Council', 's1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 2, TRUE),
    ('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'JAMB', 'Joint Admissions and Matriculation Board', 's1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 3, TRUE),
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'GRE', 'Graduate Record Examination', 's1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 4, TRUE),
    ('e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'GMAT', 'Graduate Management Admission Test', 's1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 5, TRUE),
    ('e6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'SAT', 'Scholastic Assessment Test', 's1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 6, TRUE),
    
    -- Health Sector
    ('e7eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'PLAB', 'Professional and Linguistic Assessments Board', 's2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 1, TRUE),
    ('e8eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'USMLE', 'United States Medical Licensing Examination', 's2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 2, TRUE),
    ('e9eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'NCLEX', 'National Council Licensure Examination', 's2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 3, TRUE),
    ('e10eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'AMC', 'Australian Medical Council Exam', 's2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 4, TRUE),
    ('e11eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nursing Exam', 'Various nursing certification exams', 's2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 5, TRUE),
    ('e12eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'MRCP', 'Membership of the Royal Colleges of Physicians', 's2eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 6, TRUE),
    
    -- Technology Sector
    ('e13eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'AWS Certification', 'Amazon Web Services Certifications', 's3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 1, TRUE),
    ('e14eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Azure Certification', 'Microsoft Azure Certifications', 's3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 2, TRUE),
    ('e15eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Google Cloud', 'Google Cloud Platform Certifications', 's3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 3, TRUE),
    ('e16eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'CISSP', 'Certified Information Systems Security Professional', 's3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 4, TRUE),
    ('e17eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'CompTIA', 'Computing Technology Industry Association', 's3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 5, TRUE),
    ('e18eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'CCNA', 'Cisco Certified Network Associate', 's3eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 6, TRUE),
    
    -- Finance Sector
    ('e19eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'CPA', 'Certified Public Accountant', 's4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 1, TRUE),
    ('e20eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'CFA', 'Chartered Financial Analyst', 's4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 2, TRUE),
    ('e21eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'ACCA', 'Association of Chartered Certified Accountants', 's4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 3, TRUE),
    ('e22eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'CA', 'Chartered Accountant', 's4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 4, TRUE),
    ('e23eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'FRM', 'Financial Risk Manager', 's4eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 5, TRUE),
    
    -- Law Sector
    ('e24eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'Bar Exam', 'Bar Examination', 's5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 1, TRUE),
    ('e25eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'LLM', 'Master of Laws', 's5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 2, TRUE),
    ('e26eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'CLPE', 'Common Law Admission Test', 's5eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 3, TRUE),
    
    -- Business Sector
    ('e27eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'PMP', 'Project Management Professional', 's6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 1, TRUE),
    ('e28eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'MBA', 'Master of Business Administration', 's6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 2, TRUE),
    ('e29eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'Six Sigma', 'Six Sigma Certification', 's6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 3, TRUE),
    ('e30eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'Agile', 'Agile Certifications', 's6eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 4, TRUE);

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, password_hash, first_name, last_name, is_admin, subscription_tier, subscription_status, email_verified)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@examprep.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/IzK',
    'Admin',
    'User',
    TRUE,
    'premium',
    'active',
    TRUE
);

-- Insert test users (password: password123)
INSERT INTO users (id, email, password_hash, first_name, last_name, subscription_tier, subscription_status, email_verified)
VALUES 
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'emma.okonkwo@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/IzK', 'Emma', 'Okonkwo', 'premium', 'active', TRUE),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'john.doe@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/IzK', 'John', 'Doe', 'free', 'active', TRUE),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'sarah.smith@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/IzK', 'Sarah', 'Smith', 'premium', 'active', TRUE),
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'mike.johnson@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/IzK', 'Mike', 'Johnson', 'free', 'active', TRUE);

-- Insert courses (Exam subjects)
INSERT INTO courses (id, title, slug, description, category, difficulty_level, total_duration_minutes, total_questions, is_active)
VALUES 
    ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'PLAB Medical Preparation', 'plab-medical-preparation', 'Comprehensive preparation for the Professional and Linguistic Assessments Board (PLAB) test for international medical graduates.', 'medical', 'hard', 7200, 150, TRUE),
    ('f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'USMLE Step 1', 'usmle-step-1', 'United States Medical Licensing Examination Step 1 preparation covering basic science concepts.', 'medical', 'hard', 9600, 200, TRUE),
    ('f7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'AWS Solutions Architect', 'aws-solutions-architect', 'Preparation for AWS Certified Solutions Architect - Associate examination.', 'technology', 'medium', 4800, 100, TRUE),
    ('f8eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'CISSP Certification', 'cissp-certification', 'Certified Information Systems Security Professional exam preparation.', 'technology', 'hard', 6000, 125, TRUE),
    ('f9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'CPA Examination', 'cpa-examination', 'Certified Public Accountant exam preparation for all four sections.', 'accounting', 'hard', 8400, 180, TRUE),
    ('faeebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Bar Exam Preparation', 'bar-exam-preparation', 'Comprehensive preparation for state bar examinations.', 'law', 'hard', 7200, 150, TRUE),
    ('fbeebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'PMP Certification', 'pmp-certification', 'Project Management Professional certification exam preparation.', 'business', 'medium', 3600, 80, TRUE),
    ('fceebca99-9c0b-4ef8-bb6d-6bb9bd380a23', 'NCLEX-RN', 'nclex-rn', 'National Council Licensure Examination for Registered Nurses preparation.', 'medical', 'medium', 5400, 120, TRUE);

-- Insert user course progress
INSERT INTO user_course_progress (id, user_id, course_id, progress_percentage, time_spent_minutes, last_accessed_at, current_question_id)
VALUES 
    ('g1eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 40.00, 180, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL),
    ('g2eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 65.00, 240, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL),
    ('g3eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 15.00, 60, CURRENT_TIMESTAMP - INTERVAL '3 days', NULL),
    ('g4eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'f9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 80.00, 420, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL),
    ('g5eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'f8eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 25.00, 90, CURRENT_TIMESTAMP - INTERVAL '5 days', NULL);

-- Insert questions (Medical - PLAB focus)
INSERT INTO questions (id, course_id, question_text, question_type, options, correct_answer, explanation, difficulty, topic, created_by)
VALUES 
    ('h1eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 
     'A 45-year-old patient presents with persistent pain on biting and sensitivity to heat in a lower first molar restored with a deep occlusal composite filling placed 6 months ago. Clinical examination reveals no mobility and normal periodontal probing depths. A periapical radiograph shows widening of the periodontal ligament space around the affected tooth. What is the most likely diagnosis?',
     'single_choice',
     '[{"id": "a", "text": "Reversible pulpitis"}, {"id": "b", "text": "Irreversible pulpitis"}, {"id": "c", "text": "Acute apical periodontitis"}, {"id": "d", "text": "Cracked tooth syndrome"}]',
     'c',
     'The symptoms of pain on biting and sensitivity to heat, combined with the radiographic finding of widened periodontal ligament space, are characteristic of acute apical periodontitis. This condition occurs when inflammation extends to the periodontal ligament around the apex of the tooth.',
     'medium',
     'Dental Diagnosis',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    
    ('h2eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
     'A 28-year-old woman presents with a painful, swollen right knee. She reports that the symptoms began 3 days ago and have been worsening. She has a history of intravenous drug use. On examination, the knee is warm, erythematous, and has a limited range of motion. Synovial fluid analysis reveals a white blood cell count of 80,000/mm³ with 90% neutrophils. What is the most likely diagnosis?',
     'single_choice',
     '[{"id": "a", "text": "Rheumatoid arthritis"}, {"id": "b", "text": "Gout"}, {"id": "c", "text": "Septic arthritis"}, {"id": "d", "text": "Osteoarthritis"}]',
     'c',
     'The acute onset of symptoms, high synovial fluid white blood cell count (>50,000/mm³), predominance of neutrophils, and history of IV drug use strongly suggest septic arthritis. This is a medical emergency requiring prompt antibiotic treatment and joint drainage.',
     'hard',
     'Emergency Medicine',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    
    ('h3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
     'Which of the following is the first-line treatment for community-acquired pneumonia in a previously healthy adult?',
     'single_choice',
     '[{"id": "a", "text": "Vancomycin"}, {"id": "b", "text": "Amoxicillin"}, {"id": "c", "text": "Azithromycin"}, {"id": "d", "text": "Ciprofloxacin"}]',
     'b',
     'Amoxicillin is the first-line treatment for community-acquired pneumonia in previously healthy adults. It covers the most common pathogens including Streptococcus pneumoniae. Macrolides like azithromycin are alternatives for patients with penicillin allergy.',
     'easy',
     'Pharmacology',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    
    ('h4eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'f7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
     'Which AWS service provides a fully managed NoSQL database service?',
     'single_choice',
     '[{"id": "a", "text": "Amazon RDS"}, {"id": "b", "text": "Amazon DynamoDB"}, {"id": "c", "text": "Amazon Redshift"}, {"id": "d", "text": "Amazon ElastiCache"}]',
     'b',
     'Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. It supports both key-value and document data models.',
     'easy',
     'AWS Core Services',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    
    ('h5eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'f7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
     'What is the maximum size of an S3 object?',
     'single_choice',
     '[{"id": "a", "text": "5 GB"}, {"id": "b", "text": "5 TB"}, {"id": "c", "text": "10 TB"}, {"id": "d", "text": "Unlimited"}]',
     'b',
     'The maximum size of an S3 object is 5 TB. For objects larger than 5 GB, you must use multipart upload.',
     'medium',
     'Amazon S3',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    
    ('h6eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'f9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
     'Under the accrual basis of accounting, when should revenue be recognized?',
     'single_choice',
     '[{"id": "a", "text": "When cash is received"}, {"id": "b", "text": "When the performance obligation is satisfied"}, {"id": "c", "text": "At the end of the fiscal year"}, {"id": "d", "text": "When the invoice is sent"}]',
     'b',
     'Under the accrual basis of accounting and ASC 606 (Revenue from Contracts with Customers), revenue should be recognized when the performance obligation is satisfied, which is when control of goods or services is transferred to the customer.',
     'medium',
     'Financial Accounting',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
    
    ('h7eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'f9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
     'What is the primary purpose of an audit?',
     'single_choice',
     '[{"id": "a", "text": "To detect all fraud"}, {"id": "b", "text": "To provide absolute assurance"}, {"id": "c", "text": "To express an opinion on financial statements"}, {"id": "d", "text": "To prepare financial statements"}]',
     'c',
     'The primary purpose of an audit is to express an opinion on whether the financial statements are presented fairly, in all material respects, in accordance with the applicable financial reporting framework. An audit provides reasonable assurance, not absolute assurance, and is not designed to detect all fraud.',
     'easy',
     'Auditing',
     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- Insert user streaks
INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_practice_date, weekly_activity)
VALUES 
    ('i1eebc99-9c0b-4ef8-bb6d-6bb9bd380a36', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 3, 15, CURRENT_DATE - INTERVAL '1 day', 
     '[{"date": "' || CURRENT_DATE - INTERVAL '6 days' || '", "practiced": false}, 
       {"date": "' || CURRENT_DATE - INTERVAL '5 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '4 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '3 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '2 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '1 day' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE || '", "practiced": false}]'),
    
    ('i2eebc99-9c0b-4ef8-bb6d-6bb9bd380a37', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1, 5, CURRENT_DATE - INTERVAL '1 day',
     '[{"date": "' || CURRENT_DATE - INTERVAL '6 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '5 days' || '", "practiced": false}, 
       {"date": "' || CURRENT_DATE - INTERVAL '4 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '3 days' || '", "practiced": false}, 
       {"date": "' || CURRENT_DATE - INTERVAL '2 days' || '", "practiced": false}, 
       {"date": "' || CURRENT_DATE - INTERVAL '1 day' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE || '", "practiced": false}]'),
    
    ('i3eebc99-9c0b-4ef8-bb6d-6bb9bd380a38', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 7, 30, CURRENT_DATE - INTERVAL '1 day',
     '[{"date": "' || CURRENT_DATE - INTERVAL '6 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '5 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '4 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '3 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '2 days' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE - INTERVAL '1 day' || '", "practiced": true}, 
       {"date": "' || CURRENT_DATE || '", "practiced": false}]');

-- Insert practice sessions (completed)
INSERT INTO practice_sessions (id, user_id, session_type, course_id, difficulty, total_questions, total_answered, correct_answers, accuracy_percentage, time_spent_seconds, status, started_at, completed_at)
VALUES 
    ('j1eebc99-9c0b-4ef8-bb6d-6bb9bd380a39', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'focused', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'medium', 20, 20, 15, 75.00, 2400, 'completed', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '40 minutes'),
    ('j2eebc99-9c0b-4ef8-bb6d-6bb9bd380a40', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'mock_exam', 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'hard', 50, 50, 36, 72.00, 3600, 'completed', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '60 minutes'),
    ('j3eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'focused', 'f9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'medium', 15, 15, 12, 80.00, 1800, 'completed', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '30 minutes');

-- Insert session answers
INSERT INTO session_answers (id, session_id, question_id, selected_answer, is_correct, time_spent_seconds, answered_at)
VALUES 
    ('k1eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'j1eebc99-9c0b-4ef8-bb6d-6bb9bd380a39', 'h1eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'c', true, 120, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('k2eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'j1eebc99-9c0b-4ef8-bb6d-6bb9bd380a39', 'h2eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'b', false, 180, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('k3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'j1eebc99-9c0b-4ef8-bb6d-6bb9bd380a39', 'h3eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'b', true, 90, CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Insert AI chat sessions
INSERT INTO ai_chat_sessions (id, user_id, title, messages, is_shared, created_at, updated_at)
VALUES 
    ('l1eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'PLAB Preparation Help', 
     '[{"role": "user", "content": "Can you explain the difference between reversible and irreversible pulpitis?", "timestamp": "' || CURRENT_TIMESTAMP - INTERVAL '2 days' || '"}, 
       {"role": "assistant", "content": "Reversible pulpitis is characterized by sharp, transient pain in response to stimuli that subsides when the stimulus is removed. The pulp is still vital and can recover. Irreversible pulpitis involves spontaneous pain that lingers after stimulus removal, indicating the pulp cannot heal and requires root canal treatment or extraction.", "timestamp": "' || CURRENT_TIMESTAMP - INTERVAL '2 days' || '"}]',
     false, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    
    ('l2eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'CPA Exam - Revenue Recognition',
     '[{"role": "user", "content": "When should revenue be recognized under ASC 606?", "timestamp": "' || CURRENT_TIMESTAMP - INTERVAL '1 day' || '"}, 
       {"role": "assistant", "content": "Under ASC 606, revenue should be recognized when (or as) the entity satisfies a performance obligation by transferring control of a promised good or service to a customer. This can be at a point in time or over time, depending on the nature of the performance obligation.", "timestamp": "' || CURRENT_TIMESTAMP - INTERVAL '1 day' || '"}]',
     false, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Update course question counts
UPDATE courses SET total_questions = 3 WHERE id = 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16';
UPDATE courses SET total_questions = 2 WHERE id = 'f7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18';
UPDATE courses SET total_questions = 2 WHERE id = 'f9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20';
