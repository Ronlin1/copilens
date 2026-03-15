import jsPDF from 'jspdf';

export function exportAnalysisPDF(data) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkPage = (needed = 20) => {
    if (y + needed > 275) addPage();
  };

  const addTitle = (text, size = 20) => {
    checkPage(30);
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 150, 200);
    doc.text(text, margin, y);
    y += size * 0.6;
  };

  const addSubtitle = (text) => {
    checkPage(20);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(text, margin, y);
    y += 8;
  };

  const addText = (text, indent = 0) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    lines.forEach(line => {
      checkPage(8);
      doc.text(line, margin + indent, y);
      y += 6;
    });
  };

  const addKeyValue = (key, value) => {
    checkPage(10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`${key}: `, margin + 4, y);
    const keyWidth = doc.getTextWidth(`${key}: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(String(value ?? 'N/A'), margin + 4 + keyWidth, y);
    y += 7;
  };

  const addDivider = () => {
    checkPage(10);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  // Header
  addTitle(`Copilens Analysis Report`, 22);
  addTitle(data.repoInfo?.name || 'Repository', 16);
  y += 2;
  if (data.repoInfo?.description) {
    addText(data.repoInfo.description);
  }
  addText(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
  y += 4;
  addDivider();

  // Repository Stats
  addSubtitle('Repository Statistics');
  addKeyValue('Total Commits', data.totalCommits?.toLocaleString());
  addKeyValue('Contributors', data.contributors);
  addKeyValue('Branches', data.branches);
  addKeyValue('Files Analyzed', data.filesChanged?.toLocaleString());
  addKeyValue('Lines Added', data.linesAdded?.toLocaleString());
  addKeyValue('Lines Deleted', data.linesDeleted?.toLocaleString());
  addKeyValue('Stars', data.repoInfo?.stargazers_count ?? data.githubStats?.stars ?? 'N/A');
  addKeyValue('Forks', data.repoInfo?.forks_count ?? data.githubStats?.forks ?? 'N/A');
  y += 4;
  addDivider();

  // AI Detection
  if (data.aiAnalysis) {
    addSubtitle('AI Detection Analysis');
    addKeyValue('AI-Generated Code', `${data.aiAnalysis.aiDetection?.percentage ?? 0}%`);
    addKeyValue('Confidence', data.aiAnalysis.aiDetection?.confidence || 'N/A');
    addKeyValue('Code Quality Score', `${data.aiAnalysis.codeQuality?.score ?? 0}/10`);
    addKeyValue('Documentation', data.aiAnalysis.codeQuality?.documentation || 'N/A');
    addKeyValue('Testing', data.aiAnalysis.codeQuality?.testing || 'N/A');

    if (data.aiAnalysis.aiDetection?.indicators?.length) {
      y += 3;
      addText('AI Indicators:');
      data.aiAnalysis.aiDetection.indicators.forEach(ind => {
        addText(`• ${ind}`, 6);
      });
    }
    y += 4;
    addDivider();
  }

  // Languages
  if (data.languages?.length) {
    addSubtitle('Language Distribution');
    const totalBytes = data.languages.reduce((s, l) => s + l.value, 0);
    data.languages.slice(0, 10).forEach(lang => {
      const pct = ((lang.value / totalBytes) * 100).toFixed(1);
      addKeyValue(lang.name, `${pct}%`);
    });
    y += 4;
    addDivider();
  }

  // Tech Stack
  if (data.aiAnalysis?.techStack) {
    addSubtitle('Technology Stack');
    const ts = data.aiAnalysis.techStack;
    if (ts.architecture) addKeyValue('Architecture', ts.architecture);
    if (ts.primary?.length) addKeyValue('Primary', ts.primary.join(', '));
    if (ts.frameworks?.length) addKeyValue('Frameworks', ts.frameworks.join(', '));
    if (ts.buildTools?.length) addKeyValue('Build Tools', ts.buildTools.join(', '));
    y += 4;
    addDivider();
  }

  // Complexity
  if (data.complexityData) {
    addSubtitle('Complexity Metrics');
    addKeyValue('Total Lines of Code', data.complexityData.totalLines?.toLocaleString());
    addKeyValue('Average Complexity', data.complexityData.averageComplexity?.toFixed(2));
    addKeyValue('Files Analyzed', data.complexityData.filesAnalyzed);

    if (data.complexityData.topRiskyFiles?.length) {
      y += 3;
      addText('Top Risk Files:');
      data.complexityData.topRiskyFiles.slice(0, 5).forEach(f => {
        addText(`• ${f.path} — Risk: ${f.risk?.score ?? 'N/A'}/100`, 6);
      });
    }
    y += 4;
    addDivider();
  }

  // Project Health
  if (data.aiAnalysis?.projectHealth) {
    addSubtitle('Project Health');
    const ph = data.aiAnalysis.projectHealth;
    addKeyValue('Activity Level', ph.activityLevel);
    addKeyValue('Maintenance Status', ph.maintenanceStatus);
    addKeyValue('Contributor Activity', ph.contributorActivity);
    y += 4;
    addDivider();
  }

  // Recommendations
  if (data.aiAnalysis?.recommendations?.length) {
    addSubtitle('Recommendations');
    data.aiAnalysis.recommendations.slice(0, 8).forEach((rec, i) => {
      checkPage(20);
      const priority = rec.priority ? ` [${rec.priority.toUpperCase()}]` : '';
      addText(`${i + 1}. ${rec.category || 'General'}${priority}`);
      addText(rec.suggestion, 8);
      y += 2;
    });
    addDivider();
  }

  // Summary
  if (data.aiAnalysis?.summary) {
    addSubtitle('Summary');
    addText(data.aiAnalysis.summary);
  }

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Copilens — AI-Powered Repository Analysis', margin, 288);

  const repoName = (data.repoInfo?.name || 'repository').replace(/[^a-zA-Z0-9-_]/g, '_');
  doc.save(`copilens-analysis-${repoName}.pdf`);
}
