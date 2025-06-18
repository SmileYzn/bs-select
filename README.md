### Bootstrap 5.3 Select UI Control Box

A vanilla and dynamic JavaScript framework to control and design select boxes based on Bootstrap 5 design

-----

<a target="_blank" href="https://www.jsdelivr.com/package/gh/SmileYzn/bootstrap-select"><img src="https://data.jsdelivr.com/v1/package/gh/SmileYzn/bootstrap-select/badge"></a>

#### Features
- Support Bootstrap 5 template and icons
- Search Input
- Single and multiple select support
- Option Group support
- Item create and remove support
- Remote AJAX data support
- Clear selected items with BACKSPACE key
- Language replace support
- Bootstrap icons for clear and remove tag
- Vanilla javascript, no external dependences


##### Select initialization

``` javascript
new bsSelect(document.querySelector('#bootstrap-select'), /* Object of settings */);
```

##### Full plugin with default settings

``` javascript
{
    create: false,
    clear: false,
    search: true,
    maxHeight: '400px',
    debounceSearch: 300,
    clearBackspace: true,
    searchMinLength: 3,
    autoClose: false,
    hideSelected: false,
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
    }
}
```

##### To include AJAX support in options

```javascript
    ajax:
    {
        url: 'https://api.your-site.com/ajax',
        createParameters: (searchValue) =>
        {
            return {select: 'bs-select-ajax', searchTerm: searchValue};
        }
    }
```
> Ps. Returning array as `['key' => 'value']` to act as `<option value="$key">$value</option>` is mandatory


##### Bootstrap select API methods

``` javascript
const selectElement = document.querySelector('#bootstrap-select');

if (selectElement)
{
    // Create instance
    const instance = new bsSelect(selectElement, /* Object of settings */);
    
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

    // Add new option
    // instance.add(text, value, defaultSelected, selected);

    // Remove option by value
    // instance.remove(value);
    
    // Clear selected item or selected items
    // instance.clear();
    
    // Destroy instance
    // instance.destroy();
    
    // To add an option (Vanilla JS method)
    // selectElement.append(new Option('The text of this option', 'The value of this option', true, true));
    
    // To update select box with added / removed option (Vanilla JS method)
    // selectElement.dispatchEvent(new Event('change'));
}
```
> You always can use instance or select element methods to work with API

##### Bootstrap select API events

``` javascript
document.addEventListener('DOMContentLoaded', () =>
{
    // The element
    const selectElement = document.querySelector('#bootstrap-select');

    if (selectElement)
    {
        // Instance
        const instance = new bsSelect(selectElement);

        // To listener the change event (Or any event related with <select> element)
        selectElement.addEventListener('change', () =>
        {
            // Get selected options like selectElement.value
            console.log(selectElement.value);
        });
    }
});
``` 
