"use client";

// The Studio's building blocks: buttons, choices, inputs, panels, dialogs and
// menus, all in one visual language (ui.module.css).
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import s from "./ui.module.css";

export { s as ui };

type ButtonProps = ComponentProps<"button"> & { variant?: "primary" | "accent" | "secondary" | "ghost" | "danger"; size?: "m" | "s"; icon?: ReactNode; block?: boolean };

export function Button({ variant = "secondary", size = "m", icon, block, children, className, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={`${s.button} ${className ?? ""}`} data-variant={variant} data-size={size} data-block={block || undefined} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function IconButton({ label, icon, size = "m", pressed, className, type = "button", ...rest }: ComponentProps<"button"> & { label: string; icon: ReactNode; size?: "m" | "s"; pressed?: boolean }) {
  return (
    <button type={type} className={`${s.iconButton} ${className ?? ""}`} data-size={size} aria-label={label} title={label} aria-pressed={pressed} {...rest}>
      {icon}
    </button>
  );
}

export type Option<V> = { label: ReactNode; value: V; title?: string };

export function Segmented<V extends string | number | boolean>({ value, options, onChange, label }: { value: V; options: Option<V>[]; onChange: (v: V) => void; label?: string }) {
  return (
    <div className={s.segmented} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" aria-pressed={o.value === value} title={o.title} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Chips<V extends string | number | boolean>({ value, options, onChange, label }: { value: V; options: Option<V>[]; onChange: (v: V) => void; label?: string }) {
  return (
    <div className={s.chips} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" aria-pressed={o.value === value} title={o.title} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, error, children, htmlFor }: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className={s.field}>
      {label ? (
        <label className={s.label} htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? <p className={s.error}>{error}</p> : hint ? <p className={s.hint}>{hint}</p> : null}
    </div>
  );
}

export function TextInput({ label, hint, error, value, onChange, placeholder, type = "text", autoFocus, onBlur, id: given }: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; autoFocus?: boolean; onBlur?: () => void; id?: string }) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id}>
      <input id={id} className={s.input} type={type} value={value ?? ""} placeholder={placeholder} aria-invalid={error ? true : undefined} autoFocus={autoFocus} onBlur={onBlur} onChange={(e) => onChange(e.currentTarget.value)} />
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, placeholder, rows = 3 }: { label?: ReactNode; hint?: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <textarea id={id} className={s.textarea} rows={rows} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.currentTarget.value)} />
    </Field>
  );
}

export function Select<V extends string>({ label, hint, value, options, onChange }: { label?: ReactNode; hint?: ReactNode; value: V; options: { label: string; value: V }[]; onChange: (v: V) => void }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select id={id} className={s.select} value={value} onChange={(e) => onChange(e.currentTarget.value as V)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Switch({ label, hint, checked, onChange }: { label: ReactNode; hint?: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={s.switch}>
      <span className={s.label}>{label}</span>
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.currentTarget.checked)} />
      <span className={s.track} aria-hidden="true" />
      {hint ? <span className={s.hint}>{hint}</span> : null}
    </label>
  );
}

export function PanelHead({ title, children, back }: { title: ReactNode; children?: ReactNode; back?: ReactNode }) {
  return (
    <header className={s.panelHead}>
      {back}
      <h2>{title}</h2>
      {children}
    </header>
  );
}

export function Section({ title, actions, children }: { title?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className={s.section}>
      {title || actions ? (
        <div className={s.sectionHead}>
          {title ? <h3 className={s.caps}>{title}</h3> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Empty({ title, children, action }: { title: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={s.empty}>
      <strong>{title}</strong>
      {children ? <p style={{ margin: 0 }}>{children}</p> : null}
      {action}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={s.kbd}>{children}</kbd>;
}

export function Spinner() {
  return <span className={s.spinner} role="status" aria-label="Working" />;
}

/** A native modal dialog: focus stays inside, Escape closes it. */
export function Dialog({ open, onClose, title, children, footer, size = "m", style }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; size?: "s" | "m" | "l"; style?: CSSProperties }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`${s.root} ${s.dialog}`}
      data-size={size}
      style={style}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open ? (
        <>
          <div className={s.dialogHead}>
            <h2>{title}</h2>
            <IconButton label="Close" icon={<XIcon size={18} />} onClick={onClose} />
          </div>
          <div className={s.dialogBody}>{children}</div>
          {footer ? <div className={s.dialogFoot}>{footer}</div> : null}
        </>
      ) : null}
    </dialog>
  );
}

export type MenuItem = { label: string; icon?: ReactNode; onSelect: () => void; danger?: boolean } | "divider";

/** A small menu that opens from a button, positioned to stay on screen. */
export function Menu({ trigger, items, label }: { trigger: (p: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "menu" }) => ReactNode; items: MenuItem[]; label: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open || !wrap.current || !menu.current) return;
    const r = wrap.current.getBoundingClientRect();
    const m = menu.current.getBoundingClientRect();
    const top = r.bottom + 4 + m.height > window.innerHeight ? Math.max(8, r.top - 4 - m.height) : r.bottom + 4;
    const left = Math.min(window.innerWidth - m.width - 8, Math.max(8, r.right - m.width));
    setPos({ position: "fixed", top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e.type === "pointerdown" && wrap.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <span ref={wrap} style={{ position: "relative", display: "inline-flex" }}>
      {trigger({ onClick: () => setOpen((o) => !o), "aria-expanded": open, "aria-haspopup": "menu" })}
      {open ? (
        <div ref={menu} className={s.menu} role="menu" aria-label={label} style={{ visibility: pos.top === undefined ? "hidden" : undefined, ...pos, zIndex: 1000 }}>
          {items.map((item, i) =>
            item === "divider" ? (
              <hr key={i} />
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                data-danger={item.danger || undefined}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </span>
  );
}
