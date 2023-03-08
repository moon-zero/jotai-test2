import "./styles.css";
import { useEffect, useMemo } from "react";
import { atom, Provider, useAtom } from "jotai";
import { splitAtom, selectAtom, useAtomValue } from "jotai/utils";
import { focusAtom } from "jotai/optics";
import Switch from "react-switch";

import cat from "./cat";

const catAtom = atom(cat);

// assuming the owner will never change
const ownerAtom = selectAtom(catAtom, (cat) => cat?.owner);
const infoAtom = focusAtom(catAtom, (optic) => optic.prop("info"));
const partsAtom = focusAtom(catAtom, (optic) => optic.prop("parts"));
const partsAtomAtoms = splitAtom(partsAtom);

const Editable = ({ value, onChange }) => {
  return (
    <span
      style={{
        backgroundColor: "wheat",
        paddingRight: "8px",
        paddingLeft: "8px"
      }}
      contentEditable
      suppressContentEditableWarning
      onBlur={(event) => {
        const { textContent } = event.currentTarget;
        if (value === textContent) {
          return null;
        }

        return onChange(textContent || "");
      }}
    >
      {value}
    </span>
  );
};

const Owner = () => {
  const owner = useAtomValue(ownerAtom);
  const name = [owner.firstName, owner.lastName].join(" ");

  return (
    <div>
      <h2>Owner Details</h2>
      Name: {name}
    </div>
  );
};

const Info = () => {
  const [info, setInfo] = useAtom(infoAtom);

  return (
    <div>
      <h2>Cat Details</h2>
      <div>Name: {info.name}</div>
      <div>
        Weight:{" "}
        <Editable
          value={info.weight}
          onChange={(value) =>
            setInfo((prevInfo) => ({ ...prevInfo, weight: value }))
          }
        />
        {" lbs"}
      </div>
    </div>
  );
};

const useAttributesAtom = (partAtom) => {
  return useMemo(
    () => focusAtom(partAtom, (optic) => optic.prop("attributes")),
    [partAtom]
  );
};

const useAttributeAtom = ({ attributesAtom, index }) => {
  return useMemo(() => {
    return focusAtom(attributesAtom, (optic) => optic.at(index));
  }, [attributesAtom, index]);
};

const Attribute = ({ attributesAtom, index }) => {
  const attributeAtom = useAttributeAtom({ attributesAtom, index });
  const [attribute, setAttribute] = useAtom(attributeAtom);

  return (
    <div style={{ display: "flex" }}>
      <label>
        <span style={{ marginRight: "16px" }}>{attribute.placement}</span>
        <Switch
          onChange={(checked) =>
            setAttribute((prevAttribute) => ({
              ...prevAttribute,
              injured: checked
            }))
          }
          checked={attribute.injured}
        />
      </label>
    </div>
  );
};

const Part = ({ partAtom }) => {
  const [part] = useAtom(partAtom);
  const attributesAtom = useAttributesAtom(partAtom);
  const attributes = useAtomValue(attributesAtom);

  return (
    <div>
      <h3>{part.type}</h3>
      {attributes.map((attribute, index) => {
        return (
          <Attribute
            key={attribute.placement}
            attributesAtom={attributesAtom}
            index={index}
          />
        );
      })}
    </div>
  );
};

const Parts = () => {
  const [partsAtoms] = useAtom(partsAtomAtoms);

  return (
    <div>
      <h2>Body Injury Details</h2>
      {partsAtoms.map((partAtom) => {
        return <Part key={`${partAtom}`} partAtom={partAtom} />;
      })}
    </div>
  );
};

const CatEditor = () => {
  const cat = useAtomValue(catAtom);

  useEffect(() => {
    // Here you can watch and save
    // the data remotely
    console.log(cat);
  }, [cat]);

  return (
    <div>
      <Owner />
      <Info />
      <Parts />
    </div>
  );
};

export default function App() {
  return (
    <Provider>
      <div className="App">
        <h1>Welcome to Makeshift Vet!</h1>
        <h2>Start editing to manage the cat injuries!</h2>
      </div>

      <CatEditor />
    </Provider>
  );
}
