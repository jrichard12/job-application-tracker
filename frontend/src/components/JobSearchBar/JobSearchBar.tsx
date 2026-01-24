import React, { useState } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { JobApp } from '../../types/JobApp';
import './JobSearchBar.scss';

interface JobSearchBarProps {
  jobs: JobApp[];
  onSearchResults: (results: JobApp[]) => void;
}

const JobSearchBar: React.FC<JobSearchBarProps> = ({ jobs, onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      onSearchResults(jobs);
      return;
    }
    const results = jobs.filter(job => {
      return Object.values(job).some(value =>
        value && value.toString().toLowerCase().includes(term)
      );
    });
    onSearchResults(results);
  };

  return (
    <form className="job-search-bar" onSubmit={handleSearch}>
      <TextField
        className="search-input"
        variant="outlined"
        size="small"
        placeholder="Search applications..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  className="search-btn"
                  aria-label="search"
                  size="small"
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </form>
  );
};

export default JobSearchBar;
