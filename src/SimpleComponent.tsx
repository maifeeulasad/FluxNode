import React from 'react';

interface SimpleComponentProps {
  title?: string;
  content?: string;
}

const SimpleComponent: React.FC<SimpleComponentProps> = ({ 
  title = "Default Title", 
  content = "Default content" 
}) => {
  return (
    <div>
      <div>
        <h1>{title}</h1>
      </div>
      <div>
        <p>{content}</p>
      </div>
      <div>
        <div>
          <span>Nested content</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleComponent;