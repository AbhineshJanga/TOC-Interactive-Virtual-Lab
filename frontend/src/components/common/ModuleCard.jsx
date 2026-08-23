import { Link } from "react-router";

function ModuleCard({
  name,
  description,
  path,
  status = "Core",
  disabled = false,
}) {
  const available = status === "Available";

  if (disabled) {
    return (
      <div className="cursor-default rounded-xl border border-slate-800/70 bg-slate-900/30 p-6 opacity-60">
        <CardContent
          name={name}
          description={description}
          status={status}
        />
      </div>
    );
  }

  return (
    <Link
      to={path}
      className="group block rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-slate-900"
    >
      <CardContent
        name={name}
        description={description}
        status={status}
        available={available}
      />
    </Link>
  );
}

function CardContent({
  name,
  description,
  status,
  available = false,
}) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
          {available ? "+" : "→"}
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-xs ${
            status === "Available"
              ? "border-emerald-500/30 text-emerald-400"
              : "border-slate-700 text-slate-500"
          }`}
        >
          {status}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {name}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      {available && (
        <div className="mt-5 text-sm font-medium text-blue-400 opacity-0 transition group-hover:opacity-100">
          Open laboratory →
        </div>
      )}
    </>
  );
}

export default ModuleCard;