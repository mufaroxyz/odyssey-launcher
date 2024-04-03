interface WarningProps {
  text: string;
}

export default function Warning({ text }: WarningProps) {
  return (
    <div
      className="bg-yellow-500 bg-opacity-10 border border-yellow-400 text-white px-4 py-3 rounded relative space-y-1 flex flex-col"
      role="alert"
    >
      <strong className="font-bold">Warning!</strong>
      <span className="block sm:inline">{text}</span>
    </div>
  );
}
