
import React from 'react';

const TemplateLink: React.FC = () => {
  return (
    <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-2">
      <span>Need the template?</span>
      <a
        href="https://docs.google.com/spreadsheets/d/1HoAL_4UZZB1-pa8fbaM0JuyjL21uadl98utT0tRrbiY/edit?gid=1930973159#gid=1930973159"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        View CSV Template
      </a>
    </div>
  );
};

export default TemplateLink;
