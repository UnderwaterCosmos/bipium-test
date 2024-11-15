import React, { useState, useRef, useEffect, useCallback } from 'react';
import _ from 'lodash';
import cn from 'classnames';
import { Input, InputNumber, Select } from 'antd';
import MaskedInput from 'react-input-mask';

import { formatCharsInput } from './maskFormat';
import maskIsValid from './maskValidator';

import * as styles from './styles.css';

const { TextArea } = Input;
const { Option, OptGroup } = Select;

const CodeEditor = ({ className, style, onChange, onBlur, inputRef }) => {
  const [value, setValue] = useState('');

  const onChangeHandler = (e) => {
    const newValue = e.target.value;
    setValue?.(newValue);
    onChange(value);
  };

  const onBlurHandler = () => {
    onBlur?.(value);
  };

  return (
    <TextArea
      rows={4}
      ref={inputRef}
      value={value}
      onChange={onChangeHandler}
      onBlur={onBlurHandler}
      className={className}
      style={style}
    />
  );
};

const TextInputWithActions = ({
  value: initialValue,
  autoFocus,
  readOnly,
  mask,
  prepareNumber,
  onChange,
  onEndEditing,
  onKeyDown,
  allowTabs,
  type,
  multiline,
  options,
  actions,
  children,
  theme,
  style,
  className,
  wrapperClassName,
  actionsClassName,
  minRows = 1,
  maxRows = 20,
  script,
  subType,
  config,
  ...props
}) => {
  const inputRef = useRef(null);
  const actionsNodeRef = useRef(null);

  const [actionsWidth, setActionsWidth] = useState(0);
  const [value, setValue] = useState(initialValue || '');
  const [oldValue, setOldValue] = useState('');

  const recalcActionsWidth = useCallback(() => {
    if (actionsNodeRef.current) {
      const width = actionsNodeRef.current.clientWidth;
      if (width !== actionsWidth) {
        setActionsWidth(width);
      }
    }
  }, [actionsWidth]);

  useEffect(() => {
    recalcActionsWidth();
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [recalcActionsWidth, autoFocus]);

  useEffect(() => {
    recalcActionsWidth();
  });

  const debouncedChange = useRef(
    _.debounce((val) => {
      onChange && onChange(val);
    }, 200)
  ).current;

  const valueChangeHandler = (val) => {
    setValue(val);
    debouncedChange(val);
  };

  const blurHandler = () => {
    if (readOnly) return;
    onChangeDebounceCancel();
    if (value !== oldValue) {
      onEndEditing && onEndEditing(value);
    }
    setOldValue(value);
  };

  const onChangeDebounceCancel = () => {
    debouncedChange.cancel();
  };

  const keyDownHandler = (e) => {
    onKeyDown && onKeyDown(e);

    if (allowTabs && e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertText', false, '\t');
    }
  };

  const renderSelectOption = (option) => (
    <Option key={option.value} value={option.value} label={option.label}>
      {option.label}
      {option.subLabel && (
        <span className={styles.optionSubLabel}>{option.subLabel}</span>
      )}
    </Option>
  );

  const getPlaceholderMask = (mask) => {
    const charsEditableMask = Object.keys(formatCharsInput).join('');
    let placeholder = '';
    let escaping = false;

    for (const char of mask) {
      if (escaping) {
        placeholder += char;
        escaping = false;
        continue;
      }

      if (char === '\\') {
        escaping = true;
        continue;
      }

      placeholder += charsEditableMask.includes(char) ? '_' : char;
    }

    return placeholder;
  };

  const inputCN = cn(className, {
    [styles.inputReadOnly]: readOnly,
    [styles[theme]]: !!theme,
    [styles.readOnly]: readOnly,
  });

  const inputStyle = { ...style, paddingRight: actionsWidth || undefined };

  let control;
  if (type === 'number') {
    control = readOnly ? (
      <span className={inputCN}>
        {prepareNumber ? prepareNumber(value) : value}
      </span>
    ) : (
      <InputNumber
        ref={inputRef}
        value={value}
        onChange={(val) =>
          valueChangeHandler(prepareNumber ? prepareNumber(val) : val)
        }
        onBlur={blurHandler}
        style={style}
        {...props}
      />
    );
  } else if (mask && maskIsValid(mask)) {
    control = (
      <MaskedInput
        mask={mask}
        formatChars={formatCharsInput}
        value={value}
        placeholder={getPlaceholderMask(mask)}
        onChange={(e) => valueChangeHandler(e.target.value)}
        onBlur={blurHandler}
        disabled={readOnly}
        style={inputStyle}
        className={inputCN}
      >
        {(inputProps) => <Input {...inputProps} ref={inputRef} />}
      </MaskedInput>
    );
  } else if (script) {
    control = (
      <CodeEditor
        ref={inputRef}
        value={value}
        onChange={setValue}
        onBlur={blurHandler}
        subType={subType}
        rows={config?.get('rows')}
        style={inputStyle}
        className={inputCN}
        {...props}
      />
    );
  } else if (options) {
    control = (
      <Select
        ref={inputRef}
        value={value}
        onChange={valueChangeHandler}
        onBlur={blurHandler}
        className={inputCN}
        style={{ ...inputStyle, width: '100%' }}
        showSearch
        dropdownMatchSelectWidth={300}
        bordered={false}
        {...props}
      >
        {options.map((opt) =>
          Array.isArray(opt.options) ? (
            <OptGroup key={opt.value} label={opt.label}>
              {opt.options.map(renderSelectOption)}
            </OptGroup>
          ) : (
            renderSelectOption(opt)
          )
        )}
      </Select>
    );
  } else if (multiline) {
    control = (
      <TextArea
        ref={inputRef}
        value={value}
        rows={4}
        autoSize={{ minRows, maxRows }}
        spellCheck={false}
        className={cn(inputCN, styles.textArea)}
        onChange={(e) => valueChangeHandler(e.target.value)}
        onBlur={blurHandler}
        onKeyDown={keyDownHandler}
        {...props}
      />
    );
  } else if (children) {
    control = (
      <div className={cn('ant-input', inputCN)} style={inputStyle}>
        {children}
      </div>
    );
  } else {
    control = (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => valueChangeHandler(e.target.value)}
        onBlur={blurHandler}
        onKeyDown={keyDownHandler}
        style={inputStyle}
        className={inputCN}
        {...props}
      />
    );
  }

  return (
    <div className={cn(wrapperClassName, styles.textInputContainer)}>
      {control}
      {actions?.length > 0 && (
        <ul
          ref={actionsNodeRef}
          className={cn(actionsClassName, styles.inputWithActions)}
          style={{ visibility: actionsWidth ? 'visible' : 'hidden' }}
        >
          {actions.map((node, index) => (
            <li key={index}>{node}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const UniversalInput = ({
  updateProcess,
  eventable,
  actions,
  onEndEditing,
  t,
  ...props
}) => {
  const [shouldProcess, setShouldProcess] = useState(false);

  const onChangeHandler = (value) => {
    props?.onChange(value);
    eventable && setShouldProcess(true);
  };

  const onEndEditingHandler = (value) => {
    onEndEditing && onEndEditing(value);
    setShouldProcess(false);
  };
  const inProcess = updateProcess && updateProcess.get('inProcess');

  const newActions = [...(actions || [])];
  if (shouldProcess || inProcess) {
    newActions.push(
      <span
        className={cn(styles.actionIcon, {
          [styles.actionIconGray]: inProcess,
        })}
        title={inProcess ? '' : 'ready to send'}
      ></span>
    );
  }
  return (
    <TextInputWithActions
      {...props}
      onEndEditing={onEndEditingHandler}
      onChange={onChangeHandler}
      actions={newActions}
    />
  );
};

export default UniversalInput;
