import "./index.css";

export type CheshireCatWidgetProps = {
  title: string;
};

export const CheshireCatWidget = ({ title }: CheshireCatWidgetProps) => {
  return (
    <div>
      <p className="ccat-text-2xl ccat-text-red-600">{title}</p>
      <p className="ccat-italic">Siamo po' matti qui 🐱</p>
    </div>
  );
};
