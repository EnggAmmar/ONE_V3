import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function WizardShell({
  title,
  subtitle,
  children,
  backTo,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backTo?: string;
}) {
  return (
    <div className="wizard">
      <div className="wizardHeader">
        <div className="brand">
          <div className="mark" aria-hidden />
          <div>
            <div className="brandText">CubeSat Configurator</div>
            <div className="brandSub">scene-driven prototype</div>
          </div>
        </div>

        <h1 className="h1">{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
      </div>

      <div className="wizardPanel">{children}</div>

      <div className="wizardFooter">
        {backTo ? (
          <Link className="btn btnGhost" to={backTo}>
            Back
          </Link>
        ) : (
          <span />
        )}
        <span className="hint">v1 engineering-driven pipeline</span>
      </div>
    </div>
  );
}

