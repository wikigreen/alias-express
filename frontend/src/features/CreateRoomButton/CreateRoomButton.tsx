import React, { useEffect } from "react";
import { Button } from "@mui/material";
import { useCreateRoomMutation } from "./services";
import { useNavigate } from "react-router";

export const CreateRoomButton: React.FC = () => {
  const navigate = useNavigate();
  const [createRoom, { data }] = useCreateRoomMutation();

  useEffect(() => {
    if (data?.id) {
      navigate(`/${data?.id}`);
    }
  }, [data?.id, navigate]);

  return (
    <Button
      size="small"
      fullWidth
      variant="contained"
      onClick={() => createRoom()}
    >
      Create room
    </Button>
  );
};
