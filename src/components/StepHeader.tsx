interface Props {
  step: number;
}

export default function StepHeader({ step }: Props) {
  const percentage = (step / 5) * 100; // We have 5 steps in the wizard

  return (
    <div className="mb-10 font-mono text-xs">
      <div className="flex justify-between mb-2">
        <span className="text-zinc-400">
          Step {step} of 5
        </span>
        <span className="text-white font-bold">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}
