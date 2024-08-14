import React, { useEffect } from "react";
import DeleteIcon from "../../../icons/DeleteIcon.tsx";
import axios from "axios";
import { config } from "../../../config.ts";

export default function CategoryView() {
  interface Category {
    originalCategory: string;
    modifiedCategory: string;
  }

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [successful, setSuccessful] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [newOriginalCategory, setNewOriginalCategory] = React.useState("");
  const [newModifiedCategory, setNewModifiedCategory] = React.useState("");
  const [userAddedCategories, setUserAddedCategories] = React.useState<
    Category[]
  >([]);
  const [userDeletedCategories, setUserDeletedCategories] = React.useState<
    Category[]
  >([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(config.fetchUrls.getCategories);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const transformedData = Object.entries(data).map(
          ([key, value]: [string, string]) => ({
            originalCategory: key,
            modifiedCategory: value,
          }),
        );
        setCategories(transformedData);
        setSuccessful(true);
      } catch (error) {
        console.log(error);
        setSuccessful(false);
      }
    };

    fetchCategories().then(() => setIsLoading(false));
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      (category.originalCategory
        .toLowerCase()
        .includes(searchValue.toLowerCase()) ||
        category.modifiedCategory
          .toLowerCase()
          .includes(searchValue.toLowerCase())) &&
      !userDeletedCategories.some(
        (deletedCategory) =>
          deletedCategory.originalCategory === category.originalCategory &&
          deletedCategory.modifiedCategory === category.modifiedCategory,
      ),
  );

  return (
    <div className="center">
      <h2>Categories</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : successful ? (
        <div className="pageContent">
          <div className="tableUtilities">
            <input
              type="text"
              placeholder="Search for category"
              className="searchBarForTable"
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
            />
            <button id={"SaveChangesButton"} onClick={handleSaveChanges}>
              Save Changes
            </button>
          </div>
          <div className="tableDiv">
            <table id={"categories"}>
              <tbody>
                {Array.isArray(filteredCategories) &&
                  filteredCategories.map((category, index) => (
                    <tr key={index} className="tableRow">
                      <td>{category.originalCategory}</td>
                      <td>{category.modifiedCategory}</td>
                      <td>
                        <button onClick={handleDelete(category)}>
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <table>
            <tbody id={"addNewData"}>
              <tr>
                <td>
                  <input
                    type="text"
                    placeholder="Original Category"
                    id={"category"}
                    value={newOriginalCategory}
                    onChange={(event) => {
                      setNewOriginalCategory(event.target.value);
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Modified Category"
                    id={"modifiedCategory"}
                    value={newModifiedCategory}
                    onChange={(event) => {
                      setNewModifiedCategory(event.target.value);
                    }}
                  />
                </td>
                <td>
                  <button id={"addCategory"} onClick={handleAddNewData}>
                    +
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>Failed to load categories</p>
      )}
    </div>
  );

  function handleDelete(category: Category) {
    return () => {
      setUserDeletedCategories([...userDeletedCategories, category]);
      setCategories(categories.filter((cat) => cat !== category));
    };
  }

  function handleAddNewData() {
    if (newOriginalCategory !== "" && newModifiedCategory !== "") {
      setCategories([
        {
          originalCategory: newOriginalCategory,
          modifiedCategory: newModifiedCategory,
        },
        ...categories,
      ]);
      setUserAddedCategories([
        {
          originalCategory: newOriginalCategory,
          modifiedCategory: newModifiedCategory,
        },
        ...userAddedCategories,
      ]);
      setNewOriginalCategory("");
      setNewModifiedCategory("");
    }
  }

  function handleSaveChanges() {
    if (
      userAddedCategories.length === 0 &&
      userDeletedCategories.length === 0
    ) {
      return;
    }
    const changes = {
      added: userAddedCategories,
      deleted: userDeletedCategories,
    };
    axios
      .post(config.fetchUrls.modifyCategories, changes, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Changes saved");
        console.log(response.data);
        setUserAddedCategories([]);
        setUserDeletedCategories([]);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
