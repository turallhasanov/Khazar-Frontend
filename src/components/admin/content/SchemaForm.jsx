import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button, FormField, Select, TextArea, TextInput, microLabelClass } from '../adminUi.jsx'

/**
 * Form generated from a field list, for the content sections and the journal / lookbook / FAQ editors.
 * A field: { key, label, type, hint, placeholder, wide, rows, maxLength, required, fields, max, itemLabel, newItem }.
 * Types: text (default), textarea, link, image, number, toggle, product (select from `context.products`),
 * group (nested `fields`), strings (list of texts), items (list of objects with `fields`).
 * `errors` is keyed by path ("header.title", "pillars[0].text"), the same paths the API names in its errors.
 */
export function SchemaForm({ fields, value, onChange, errors = {}, path = '', context = {} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <SchemaField
          key={field.key}
          field={field}
          value={value?.[field.key]}
          onChange={(next) => onChange({ ...value, [field.key]: next })}
          errors={errors}
          path={path ? `${path}.${field.key}` : field.key}
          context={context}
        />
      ))}
    </div>
  )
}

const span = (field) => (field.wide || ['textarea', 'group', 'strings', 'items', 'image'].includes(field.type) ? 'sm:col-span-2' : '')

function SchemaField({ field, value, onChange, errors, path, context }) {
  const error = errors[path]

  switch (field.type) {
    case 'group':
      return (
        <fieldset className="border-t border-linen-200 pt-5 sm:col-span-2">
          <legend className={`${microLabelClass} pr-3 text-ink-700`}>{field.label}</legend>
          {field.hint && <p className="mb-4 text-[11px] text-ink-400">{field.hint}</p>}
          <div className="mt-3">
            <SchemaForm fields={field.fields} value={value ?? {}} onChange={onChange} errors={errors} path={path} context={context} />
          </div>
        </fieldset>
      )

    case 'strings':
    case 'items':
      return <ListField field={field} items={value ?? []} onChange={onChange} errors={errors} path={path} context={context} />

    case 'toggle':
      return (
        <label className={`flex cursor-pointer items-start gap-3 border border-ink-900/10 px-4 py-3 ${span(field)}`}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-ink-900"
          />
          <span>
            <span className="block text-sm text-ink-900">{field.label}</span>
            {field.hint && <span className="mt-0.5 block text-[11px] text-ink-400">{field.hint}</span>}
          </span>
        </label>
      )

    default:
      return (
        <FormField
          label={field.label}
          required={field.required}
          error={error}
          hint={field.hint}
          counter={field.maxLength && typeof value === 'string' ? `${value.length}/${field.maxLength}` : null}
          className={span(field)}
        >
          {(props) => <Control field={field} value={value} onChange={onChange} props={props} context={context} />}
        </FormField>
      )
  }
}

function Control({ field, value, onChange, props, context }) {
  const text = value ?? ''
  const common = { ...props, placeholder: field.placeholder, maxLength: field.maxLength }

  switch (field.type) {
    case 'textarea':
      return <TextArea {...common} rows={field.rows ?? 4} value={text} onChange={(event) => onChange(event.target.value)} />
    case 'number':
      return (
        <TextInput
          {...props}
          type="number"
          inputMode="numeric"
          min={field.min ?? 0}
          max={field.max}
          step={field.step ?? 1}
          value={value ?? 0}
          onChange={(event) => onChange(event.target.value === '' ? 0 : Number(event.target.value))}
          className="tabular-nums"
        />
      )
    case 'product':
      return (
        <Select {...props} value={text} onChange={(event) => onChange(event.target.value)}>
          <option value="">{field.placeholder ?? '— Məhsul seçin —'}</option>
          {(context.products ?? []).map((product) => (
            <option key={product.id} value={product.slug}>
              {product.name}
              {product.isActive === false ? ' (arxivdə)' : ''}
            </option>
          ))}
          {text && !(context.products ?? []).some((product) => product.slug === text) && (
            <option value={text}>{text} (tapılmadı)</option>
          )}
        </Select>
      )
    case 'image':
      return (
        <div className="flex gap-3">
          <TextInput {...common} value={text} onChange={(event) => onChange(event.target.value)} className="font-mono text-[12px]" />
          {text && (
            <img
              src={text}
              alt=""
              onError={(event) => {
                event.currentTarget.style.visibility = 'hidden'
              }}
              onLoad={(event) => {
                event.currentTarget.style.visibility = 'visible'
              }}
              className="h-10 w-10 shrink-0 border border-ink-900/10 bg-linen-100 object-cover"
            />
          )}
        </div>
      )
    case 'link':
      return <TextInput {...common} value={text} onChange={(event) => onChange(event.target.value)} className="font-mono text-[12px]" />
    default:
      return <TextInput {...common} value={text} onChange={(event) => onChange(event.target.value)} />
  }
}

/** Ordered list editor: move up / down, remove, add (up to `field.max`). */
function ListField({ field, items, onChange, errors, path, context }) {
  const max = field.max ?? 30
  const move = (index, delta) => {
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    onChange(next)
  }
  const replace = (index, item) => onChange(items.map((current, i) => (i === index ? item : current)))
  const remove = (index) => onChange(items.filter((_, i) => i !== index))
  const add = () => onChange([...items, field.type === 'strings' ? '' : field.newItem()])
  const listError = errors[path]

  return (
    <div className="sm:col-span-2">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className={microLabelClass}>{field.label}</span>
        <span className="text-[10px] tabular-nums text-ink-400">
          {items.length}/{max}
        </span>
      </div>
      {field.hint && <p className="mb-3 text-[11px] text-ink-400">{field.hint}</p>}
      {listError && <p className="mb-3 animate-fade-in text-[11px] text-clay-600">{listError}</p>}

      <ol className="space-y-2">
        {items.map((item, index) => {
          const itemPath = `${path}[${index}]`
          const controls = (
            <div className="flex shrink-0 gap-0.5">
              <Button size="icon" variant="ghost" aria-label="Yuxarı" title="Yuxarı" disabled={index === 0} onClick={() => move(index, -1)}>
                <ArrowUp size={13} strokeWidth={1.5} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Aşağı"
                title="Aşağı"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={13} strokeWidth={1.5} />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Sil" title="Sil" onClick={() => remove(index)} className="hover:text-clay-600">
                <Trash2 size={13} strokeWidth={1.5} />
              </Button>
            </div>
          )

          if (field.type === 'strings') {
            const Input = field.multiline ? TextArea : TextInput
            return (
              <li key={index} className="flex items-start gap-2">
                <span className="w-6 shrink-0 pt-2.5 text-right text-[11px] tabular-nums text-ink-400">{index + 1}.</span>
                <div className="min-w-0 flex-1">
                  <Input
                    aria-label={`${field.itemLabel ?? field.label} ${index + 1}`}
                    aria-invalid={errors[itemPath] ? true : undefined}
                    rows={field.multiline ? 3 : undefined}
                    value={item}
                    onChange={(event) => replace(index, event.target.value)}
                  />
                  {errors[itemPath] && <p className="mt-1 text-[11px] text-clay-600">{errors[itemPath]}</p>}
                </div>
                {controls}
              </li>
            )
          }

          return (
            <li key={index} className="border border-ink-900/10 bg-linen-100/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-500">
                  {field.itemLabel ?? 'Element'} {index + 1}
                </span>
                {controls}
              </div>
              <SchemaForm
                fields={field.fields}
                value={item}
                onChange={(next) => replace(index, next)}
                errors={errors}
                path={itemPath}
                context={context}
              />
            </li>
          )
        })}
      </ol>

      <Button size="sm" onClick={add} disabled={items.length >= max} className="mt-3">
        <Plus size={13} strokeWidth={1.75} />
        {field.itemLabel ?? 'Element'} əlavə et
      </Button>
    </div>
  )
}
