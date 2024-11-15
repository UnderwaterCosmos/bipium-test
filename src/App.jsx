import React, { useState, useEffect } from 'react';
import UniversalInput from './UniversalInput';
import { useLocalStorage } from './hooks/useLocalStorage';
import { initialData, initialValues } from './data';
import './App.css';

const App = () => {
  const storagedValues = useLocalStorage('inputValues');
  const areNoValues = Object.values(storagedValues.getItem()).every(
    (value) => value === ''
  );
  const inputsData = areNoValues ? initialValues : storagedValues.getItem();

  const [values, setValues] = useState(inputsData);

  useEffect(() => {
    storagedValues.setItem(values);
  }, [values]);

  const onChangeHandler = ({ value, key }) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="main">
      <h1 className="title">THIS IS NOT A TEST TASK (ASSURE YOU IT'S NOT)</h1>
      <div className="inputItems">
        {initialData.map((inputItem) => (
          <UniversalInput
            type={inputItem.type}
            value={values[inputItem.valueNumber]}
            onChange={(e) =>
              onChangeHandler({
                value: e,
                key: inputItem.valueNumber,
              })
            }
            placeholder={inputItem.placeholder}
            mask={inputItem.mask}
            options={inputItem.options}
            multiline={inputItem.multiline}
            style={inputItem.style}
            className="inputItem"
            key={inputItem.id}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
