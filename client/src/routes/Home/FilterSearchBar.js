import { useEffect, useRef } from "react";
import "./ContactList.css";
import { Input } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import stringAvatar from "./nameToAvatar";

function useOutsideClick(ref, setDropdownOpened) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setDropdownOpened(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

const FilterSearchBar = ({
  searchValue,
  setSearchValue,
  dropdownOpened,
  setDropdownOpened,
  suggestions,
  handleSearchResultClick,
}) => {
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, setDropdownOpened);
  return (
    <div ref={wrapperRef}>
      <Input
        label="Search for Contact"
        variant="outlined"
        placeholder="Search for Contacts"
        sx={{ height: 17, fontSize: 12 }}
        value={searchValue}
        onFocus={() => {
          setDropdownOpened(true);
        }}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
      />
      <div
        className={`filterDropdown  ${!dropdownOpened && "filterDropdownOff"}`}
      >
        {suggestions.length
          ? suggestions.map((user) => {
              return (
                <div
                  key={user.id}
                  className="searchResult"
                  onClick={() => {
                    handleSearchResultClick(user);
                  }}
                >
                  {user.avatar ? (
                    <Avatar alt={user.username} src={user.avatar} />
                  ) : (
                    <Avatar {...stringAvatar(user.username)} />
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "300px",
                      padding: 10,
                    }}
                  >
                    <span>{user.username}</span>
                    <span
                      style={{
                        fontSize: 12,
                        opacity: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.email}
                    </span>
                  </div>
                </div>
              );
            })
          : !!searchValue.length && (
              <p style={{ opacity: "0.55", alignSelf: "center" }}>
                No user found
              </p>
            )}
      </div>
    </div>
  );
};

export default FilterSearchBar;
