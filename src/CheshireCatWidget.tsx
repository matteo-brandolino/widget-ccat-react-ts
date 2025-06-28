import "./index.css";

type CheshireCatWidgetProps = {
  title: string;
};

export const CheshireCatWidget = ({ title }: CheshireCatWidgetProps) => {
  return (
    <div className="bg-purple-500 text-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 italic bg-red-600">Siamo aa un po' matti qui 🐱</p>
    </div>
  );
};
