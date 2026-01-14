import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GraduationCap, Briefcase, Award, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { Textarea } from '@/components/ui/textarea';
import { MasterResume } from '@/lib/data';

interface MasterResumeBuilderProps {
  resume: MasterResume;
  onUpdate: (resume: MasterResume) => void;
}

export function MasterResumeBuilder({ resume, onUpdate }: MasterResumeBuilderProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary', 'experience']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const addExperience = () => {
    onUpdate({
      ...resume,
      experience: [
        ...resume.experience,
        {
          id: crypto.randomUUID(),
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        },
      ],
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    onUpdate({
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onUpdate({
      ...resume,
      experience: resume.experience.filter(exp => exp.id !== id),
    });
  };

  const addEducation = () => {
    onUpdate({
      ...resume,
      education: [
        ...resume.education,
        {
          id: crypto.randomUUID(),
          degree: '',
          school: '',
          graduationDate: '',
        },
      ],
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onUpdate({
      ...resume,
      education: resume.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onUpdate({
      ...resume,
      education: resume.education.filter(edu => edu.id !== id),
    });
  };

  const addSkill = () => {
    const skill = prompt('Enter a skill:');
    if (skill) {
      onUpdate({ ...resume, skills: [...resume.skills, skill] });
    }
  };

  const removeSkill = (index: number) => {
    onUpdate({
      ...resume,
      skills: resume.skills.filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    const cert = prompt('Enter certification name:');
    if (cert) {
      onUpdate({ ...resume, certifications: [...resume.certifications, cert] });
    }
  };

  const removeCertification = (index: number) => {
    onUpdate({
      ...resume,
      certifications: resume.certifications.filter((_, i) => i !== index),
    });
  };

  const SectionHeader = ({ title, icon: Icon, section, count }: { title: string; icon: any; section: string; count?: number }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="font-bold text-lg">{title}</span>
        {count !== undefined && (
          <span className="px-2 py-0.5 bg-muted rounded-full text-sm text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {expandedSections.includes(section) ? (
        <ChevronUp className="w-5 h-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <CardRetro>
        <SectionHeader title="Professional Summary" icon={FileText} section="summary" />
        <AnimatePresence>
          {expandedSections.includes('summary') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardRetroContent>
                <Textarea
                  placeholder="Write a compelling summary of your professional background, key achievements, and career goals..."
                  value={resume.summary}
                  onChange={(e) => onUpdate({ ...resume, summary: e.target.value })}
                  className="min-h-[120px] border-2 border-border focus:border-primary"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  💡 Tip: Keep it to 2-3 sentences highlighting your unique value proposition
                </p>
              </CardRetroContent>
            </motion.div>
          )}
        </AnimatePresence>
      </CardRetro>

      {/* Skills Section */}
      <CardRetro>
        <SectionHeader title="Skills" icon={Award} section="skills" count={resume.skills.length} />
        <AnimatePresence>
          {expandedSections.includes('skills') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardRetroContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {resume.skills.map((skill, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(index)}
                        className="hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
                <ButtonRetro variant="outline" size="sm" onClick={addSkill}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </ButtonRetro>
              </CardRetroContent>
            </motion.div>
          )}
        </AnimatePresence>
      </CardRetro>

      {/* Experience Section */}
      <CardRetro>
        <SectionHeader title="Work Experience" icon={Briefcase} section="experience" count={resume.experience.length} />
        <AnimatePresence>
          {expandedSections.includes('experience') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardRetroContent className="space-y-4">
                {resume.experience.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-2 border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-muted-foreground">Experience {index + 1}</span>
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputRetro
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      />
                      <InputRetro
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      />
                    </div>
                    <InputRetro
                      placeholder="Location (e.g., San Francisco, CA or Remote)"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <InputRetro
                        type="month"
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      />
                      <div className="space-y-2">
                        <InputRetro
                          type="month"
                          placeholder="End Date"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          disabled={exp.current}
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            className="rounded border-2 border-border"
                          />
                          Currently working here
                        </label>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      className="min-h-[80px] border-2 border-border focus:border-primary"
                    />
                  </motion.div>
                ))}
                <ButtonRetro variant="outline" onClick={addExperience}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </ButtonRetro>
              </CardRetroContent>
            </motion.div>
          )}
        </AnimatePresence>
      </CardRetro>

      {/* Education Section */}
      <CardRetro>
        <SectionHeader title="Education" icon={GraduationCap} section="education" count={resume.education.length} />
        <AnimatePresence>
          {expandedSections.includes('education') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardRetroContent className="space-y-4">
                {resume.education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-2 border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-muted-foreground">Education {index + 1}</span>
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <InputRetro
                      placeholder="Degree (e.g., Bachelor of Science in Computer Science)"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <InputRetro
                        placeholder="School Name"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      />
                      <InputRetro
                        type="month"
                        placeholder="Graduation Date"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                      />
                    </div>
                  </motion.div>
                ))}
                <ButtonRetro variant="outline" onClick={addEducation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </ButtonRetro>
              </CardRetroContent>
            </motion.div>
          )}
        </AnimatePresence>
      </CardRetro>

      {/* Certifications Section */}
      <CardRetro>
        <SectionHeader title="Certifications" icon={Award} section="certifications" count={resume.certifications.length} />
        <AnimatePresence>
          {expandedSections.includes('certifications') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardRetroContent>
                <div className="space-y-2 mb-4">
                  {resume.certifications.map((cert, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="font-medium">🏆 {cert}</span>
                      <button
                        onClick={() => removeCertification(index)}
                        className="p-1 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
                <ButtonRetro variant="outline" size="sm" onClick={addCertification}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certification
                </ButtonRetro>
              </CardRetroContent>
            </motion.div>
          )}
        </AnimatePresence>
      </CardRetro>
    </div>
  );
}
