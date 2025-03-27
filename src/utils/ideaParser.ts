
/**
 * Utility functions for parsing AI-generated idea content
 */

/**
 * Parse raw AI content and extract structured idea data
 */
export const parseIdeasFromAIContent = (content: string) => {
  console.log("Raw AI content to parse:", content);
  
  const ideaSections = content.split(/##\s*Idea\s*\d+\s*:/i).filter(Boolean);
  
  if (ideaSections.length === 0) {
    const alternativeSections = content.split(/Idea\s*\d+\s*:/i).filter(Boolean);
    if (alternativeSections.length > 0) {
      return alternativeSections.map(parseIdeaSection);
    }
    
    const paragraphs = content.split(/\n\n+/).filter(section => 
      section.trim().length > 10 && 
      !section.toLowerCase().includes('here are') && 
      !section.toLowerCase().includes('below are')
    );
    
    if (paragraphs.length > 0) {
      return paragraphs.map(parseIdeaSection);
    }
  }
  
  return ideaSections.map(parseIdeaSection);
};

/**
 * Parse a single idea section from AI content
 */
export const parseIdeaSection = (section: string) => {
  console.log("Parsing section:", section);
  
  const titleMatch = section.match(/^\s*([^\n]+)/) || 
                   section.match(/\s*([^:\n]+)/) || 
                   section.match(/\[([^\]]+)\]/);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Idea';
  
  const descMatch = section.match(/Description\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*Target|$)/i) || 
                   section.match(/([^\n]+)(?=\n\s*Target|$)/i) ||
                   section.match(/:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*[A-Z]|$)/i);
  const description = descMatch ? descMatch[1].trim() : '';
  
  const targetMatch = section.match(/Target\s*Audience\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*Problem|$)/i) ||
                     section.match(/Target\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*Problem|$)/i) ||
                     section.match(/For\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*Problem|$)/i);
  const targetAudience = targetMatch ? targetMatch[1].trim() : '';
  
  const problemMatch = section.match(/Problem\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*Key Features|$)/i) ||
                      section.match(/Problem\s*Solved\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*Key Features|$)/i) ||
                      section.match(/Pain\s*Point\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*Key Features|$)/i);
  const problemSolved = problemMatch ? problemMatch[1].trim() : '';
  
  const featuresMatch = section.match(/Key Features\s*:([^\n]*(?:\n\s*[-*•]?[^\n]*)*?)(?=\n\s*Revenue|$)/i) ||
                       section.match(/Features\s*:([^\n]*(?:\n\s*[-*•]?[^\n]*)*?)(?=\n\s*Revenue|$)/i);
  let features: string[] = [];
  
  if (featuresMatch) {
    const featureText = featuresMatch[1];
    
    const bulletedItems = featureText.match(/\n\s*[-*•]\s*([^\n]+)/g);
    if (bulletedItems && bulletedItems.length > 0) {
      features = bulletedItems.map(item => item.replace(/\n\s*[-*•]\s*/, '').trim()).filter(Boolean);
    } else {
      const numberedItems = featureText.match(/\n\s*\d+\.\s*([^\n]+)/g);
      if (numberedItems && numberedItems.length > 0) {
        features = numberedItems.map(item => item.replace(/\n\s*\d+\.\s*/, '').trim()).filter(Boolean);
      } else {
        features = featureText.split('\n').map(f => f.trim()).filter(Boolean);
      }
    }
  }
  
  if (features.length === 0) {
    const listItems = section.match(/\n\s*[-*•]\s*([^\n]+)/g);
    if (listItems && listItems.length > 0) {
      features = listItems.map(item => item.replace(/\n\s*[-*•]\s*/, '').trim()).filter(Boolean);
    }
  }
  
  const revenueMatch = section.match(/Revenue\s*Model\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*##|$)/i) ||
                      section.match(/Monetization\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*##|$)/i) ||
                      section.match(/Business\s*Model\s*:\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*##|$)/i);
  const revenueModel = revenueMatch ? revenueMatch[1].trim() : '';
  
  const result = {
    title: title || 'Untitled Idea',
    description: description || 'No description provided',
    target_audience: targetAudience || 'Not specified',
    problem_solved: problemSolved || 'Not specified',
    ai_generated_data: {
      key_features: features.length > 0 ? features : ['Not specified'],
      revenue_model: revenueModel || 'Not specified'
    }
  };
  
  console.log("Parsed result:", result);
  return result;
};
