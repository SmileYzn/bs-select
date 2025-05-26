### Bootstrap 5.3 Select UI Control Box

A vanilla and dynamic JavaScript framework to control and design select boxes based on Bootstrap 5 design

-----

#### Features
- Support Bootstrap 5 template and icons
- Search Input
- Single and multiple select support
- Item creation support
- AJAX support
- Clear selected items with BACKSPACE key
- Language replace support
- Bootstrap icons for clear and remove tag
- Vanilla javascript, no external dependences

##### Select initialization

``` javascript
new bsSelect(document.querySelector('#bootstrap-select'), /* Object of options */);
```

##### Full Plugin Default Options (With AJAX Support)

``` javascript
{
    create: false,
    clear: true,
    maxHeight: '400px',
    debounceSearch: 300,
    clearBackspace: true,
    searchMinLength: 3,
    lang:
    {
        searchAddPlaceholder: 'Type ENTER to add: [search-value]',
        noResults: 'No results found',
        typeSearch: 'Type [length] or more characters to search',
        clearSelect: 'Clear selection',
        placeholder: 'Select an option',
        placeholderMultiple: 'Select one or more options',
    },
    icon:
    {
        clear: 'bi bi-x',
        removeTag: 'bi bi-x-circle-fill'
    },
    ajax:
    {
        url: 'https://github.com/select/ajax.php',
        createParameters: (searchValue) =>
        {
            return {select: 'bs-select-ajax', searchTerm: searchValue};
        }
    }
}
```

##### Bootstrap select API methods

``` javascript
const instance = new bsSelect(document.querySelector('#bootstrap-select'), /* Object of options */);

// Refresh select box with added / removed select option items
// instance.refresh();

// Set selected option
// instance.set(/* String of alue '' */);
// instance.set(/* Array of values [] */);

// Get selected option / options as string or array
// instance.get();

// Toggle selected option or selected options
// instance.toggle(/* String of alue '' */, /* selected value as boolean true or false*/);
// instance.toggle(/* Array of values [] */, /* selected value as boolean true or false*/);

// Clear selected item or selected items
// instance.clear();

// Destroy instance
// instnace.destroy();
```
