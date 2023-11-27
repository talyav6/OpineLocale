import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Autocomplete = ({ options = [], value, placeholder, onChange }) => {
  const autocomplete = useRef();

  const [optionsData, setOptionsData] = useState([]);
  const [query, setQuery] = useState(value);
  const [isShow, setIsShow] = useState(false);

  const handleInputChange = (v) => {
    setQuery(v);
    onChange(v);
    v === ""
      ? setOptionsData([])
      : setOptionsData([
          ...options.filter(
            (x) => x.toLowerCase().indexOf(v.toLowerCase()) > -1
          )
        ]);
  };

  const handleClickOutSide = (e) => {
    if (!autocomplete.current.contains(e.target)) {
      setIsShow(false);
    }
  };

  const hilightSearchText = (text) => {
    var pattern = new RegExp("(" + query + ")", "gi");
    var new_text = text.replace(pattern, `<b>${query}</b>`);
    return new_text;
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutSide);
    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  }, []);

  useEffect(() => {
    optionsData.length !== 0 ? setIsShow(true) : setIsShow(false);
  }, [optionsData]);

  return (
    <Wrapper ref={autocomplete}>
      <InputField
        type="search"
        placeholder={placeholder}
        isSearch={true}
        value={query}
        name="userName"
        id="userName"
        onChange={(e) => handleInputChange(e.target.value)}
      />
      {isShow && (
        <ListWrapper>
          {optionsData.map((x, index) => (
            <ListItem
              onClick={() => {
                setQuery(x);
                setIsShow(false);
                onChange(x);
              }}
              key={index}
            >
              {
                <div
                  dangerouslySetInnerHTML={{ __html: hilightSearchText(x) }}
                />
              }
            </ListItem>
          ))}
        </ListWrapper>
      )}
    </Wrapper>
  );
};

export default Autocomplete;

const Wrapper = styled.div`
  position: relative;
  min-width: 320px;
`;

const InputField = styled.input`
  position: relative;
  width: 100%;
  font-size: 14px;
  color: #000;
  border: 2px solid #e3e3e3;
  border-radius: 8px;
  padding: 0 12px;
  height: 44px;
  outline: none;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: 0.5rem;
  position: absolute;
  top: 44px;
  z-index: 10;
  background: #fff;
  border-radius: 4px;
  width: 100%;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

const ListItem = styled.button`
  text-align: left;
  padding: 16px 8px;
  width: 100%;
  background: #fff;
  outline: none;
  border: none;
  &:hover {
    background: #e2e2e2;
  }
`;