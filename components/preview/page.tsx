interface PreviewProps {
    icon: string;
    label: string;
    description: string;
    title: string;
  }
  
  const Preview: React.FC<PreviewProps> = ({ icon, label, description, title }) => {
    return (
      <div className="preview-container">
        <img src={icon} alt={label} />
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    )
  }
  
  export default Preview;
  