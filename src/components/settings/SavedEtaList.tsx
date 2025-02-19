import React, { useState, useContext, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import AppContext from "../../AppContext";
import SuccinctTimeReport from "../home/SuccinctTimeReport";
import { reorder } from "../../utils";
import { useTranslation } from "react-i18next";
import { ManageMode } from "../../data";

const SavedEtaList = ({ mode }: { mode: ManageMode }) => {
  const {
    db: { routeList },
    savedEtas,
    setSavedEtas,
    updateSavedEtas,
  } = useContext(AppContext);
  const [items, setItems] = useState(
    // cannot use Array.reverse() as it is in-place reverse
    savedEtas.filter((id) => id.split("/")[0] in routeList).reverse()
  );
  const { t } = useTranslation();

  const handleDragEnd = useCallback(
    ({ destination, source }: DropResult) => {
      // dropped outside the list
      if (!destination) return;

      const newItems = reorder(items, source.index, destination.index);

      setItems(newItems);
      setSavedEtas(Array.from(newItems).reverse());
    },
    [items, setSavedEtas]
  );

  const handleDelete = useCallback(
    (eta: string) => {
      updateSavedEtas(eta);
      setItems((prev) => prev.filter((v) => v !== eta));
    },
    [updateSavedEtas]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="saved-eta-list">
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={containerSx}
          >
            {items.length ? (
              items.map((eta, index) => (
                <React.Fragment key={`savedEta-${eta}`}>
                  <DraggableListItem
                    item={eta}
                    index={index}
                    mode={mode}
                    onDelete={(_) => handleDelete(eta)}
                  />
                </React.Fragment>
              ))
            ) : (
              <Typography sx={{ textAlign: "center", marginTop: 5 }}>
                <b>{t("未有收藏路線")}</b>
              </Typography>
            )}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SavedEtaList;

const DraggableListItem = ({ item, index, mode, onDelete }) => (
  <Draggable draggableId={item} index={index} isDragDisabled={mode === "order"}>
    {(provided) => (
      <Box
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        sx={entrySx}
      >
        <SuccinctTimeReport routeId={item} mode={mode} onDelete={onDelete} />
      </Box>
    )}
  </Draggable>
);

const containerSx: SxProps<Theme> = {
  p: 1,
};

const entrySx: SxProps<Theme> = {
  px: 2,
  py: 1,
  boxShadow: "2px 2px 2px 1px rgba(0, 0, 0, 0.1)",
  display: "flex",
};
