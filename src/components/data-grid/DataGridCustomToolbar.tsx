import React from 'react';
import {
  GridToolbarDensitySelector,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

const DataGridCustomToolbar = () => {
  return (
    <GridToolbarContainer className=" ">
      <div className="flex justify-between ">
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <GridToolbarFilterButton />
        <GridToolbarExport />
      </div>
    </GridToolbarContainer>
  );
};

export default DataGridCustomToolbar;
