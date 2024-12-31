import React, { useState } from "react";
import { TextField, Button, InputAdornment } from "@mui/material";

interface CopyableFieldProps {
  valueToCopy: string;
  valueInInput: string;
}

const CopyableField: React.FC<CopyableFieldProps> = ({
  valueToCopy,
  valueInInput,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(valueToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000); // Reset button text after 3 seconds
  };

  return (
    <TextField
      value={valueInInput}
      fullWidth
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Button variant="contained" onClick={handleCopy}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </InputAdornment>
          ),
          readOnly: true,
        },
      }}
    />
  );
};

export default CopyableField;
