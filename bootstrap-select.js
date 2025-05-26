(function ()
{
    'use strict';
    
    function debounceFunction(func, delay)
    {
        let id = 0;

        return function (...args)
        {
            clearTimeout(id);

            id = setTimeout(() =>
            {
                func.apply(this, args);
            }, delay);
        };
    };

    function bsSelect(element, options)
    {
        if (!element || element.tagName !== 'SELECT')
        {
            throw new Error('Use a <select> element to work with bsSelect.');
        }

        this.element = element;

        this.options = Object.assign({},
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
            }
        }, options);
        
        const create = () =>
        {
            const value = this.dropdownSearch.value.trim();
            
            if (value)
            {
                if (!Array.from(this.element.options).some(o => o.value === value))
                {
                    this.element.insertAdjacentElement('afterbegin', new Option(value, value, true, true));
                    
                    this.element.dispatchEvent(new Event('change'));

                    this.dropdownSearch.value = '';
                    
                    this.dropdownSearch.dispatchEvent(new Event('keyup'));
                }
            }
        };

        const searchAjax = (value, minlength) =>
        {
            if (value.length >= minlength)
            {
                this.element.querySelectorAll('*').forEach((option) =>
                {
                    option.remove();
                });
                
                this.element.insertAdjacentElement('afterbegin', new Option('', '', false, false));
                
                fetch(this.options.ajax.url + '?' + new URLSearchParams(this.options.ajax.createParameters(value))).then(response => response.json()).then(results =>
                {
                    if (results.length > 0)
                    {
                        results.forEach((item) =>
                        {
                            this.element.insertAdjacentElement('afterbegin', new Option(item.text, item.value, false, false));
                        });
                    }
                }).finally(() =>
                {
                    updateDropdown();
                });
            }
        };

        const search = (event, filterValue, minlength) =>
        {
            const headers = Array.from(this.dropdownMenu.querySelectorAll('h6.dropdown-header'));
            const items = Array.from(this.dropdownMenu.querySelectorAll('button.dropdown-item'));
            const noResults = this.dropdownMenu.querySelector('span.dropdown-item');

            if (headers.length)
            {
                headers.forEach((header) =>
                {
                    header.style.display = 'none';
                });
            }

            if (items.length)
            {
                items.forEach((item) =>
                {
                    const filterText = item.textContent.toLowerCase();
                    const isVisible = filterText.includes(filterValue);

                    item.style.display = (isVisible ? 'block' : 'none');

                    if (isVisible)
                    {
                        if (headers.length > 0)
                        {
                            let current = item.previousElementSibling;
                            while (current)
                            {
                                if (current.classList.contains('dropdown-header'))
                                {
                                    current.style.display = '';
                                    break;
                                }
                                current = current.previousElementSibling;
                            }
                        }
                    }
                });
            }

            if (headers.length)
            {
                headers.forEach((header) =>
                {
                    const filterText = header.textContent.toLowerCase();
                    const isVisible = filterText.includes(filterValue);

                    if (isVisible)
                    {
                        header.style.display = '';

                        let current = header.nextElementSibling;
                        while (current && !current.classList.contains('dropdown-header'))
                        {
                            current.style.display = '';
                            current = current.nextElementSibling;
                        }
                    }
                });
            }

            const foundItems = items.filter((item) => ((item.style.display !== 'none') && !item.hasAttribute('hidden')));

            if (foundItems.length === 0)
            {
                if (noResults)
                {
                    noResults.style.display = '';

                    if (this.options.create)
                    {
                        if (this.dropdownSearch.value)
                        {
                            noResults.textContent = this.options.lang.searchAddPlaceholder.replace('[search-value]', this.dropdownSearch.value);

                            if (event.key === 'Enter')
                            {
                                create();
                            }
                        }
                    }
                    else
                    {
                        noResults.textContent = this.options.lang.noResults;

                        if (filterValue.length < minlength)
                        {
                            noResults.textContent = this.options.lang.typeSearch.replace('[length]', (minlength - filterValue.length));
                        }
                    }
                }
            }
            else
            {
                if (noResults)
                {
                    noResults.style.display = 'none';
                    noResults.textContent = this.options.lang.noResults;
                }

                if (foundItems.length === 1)
                {
                    if (event.key === 'Enter')
                    {
                        foundItems.forEach((item) =>
                        {
                            item.click();

                            this.dropdownSearch.value = '';
                        });
                    }
                }
            }
        };
        
        const removeLastSelectedTag = () =>
        {
            if (this.element.selectedOptions.length)
            {
                if (this.element.multiple)
                {
                    const option = Array.from(this.element.selectedOptions).reverse().find((opt) => (opt.hasAttribute('value') && opt.value !== ''));

                    if (option)
                    {
                        option.selected = false;
                    }
                }
                else
                {
                    this.element.value = '';
                }
                
                updateDropdown();

                this.dropdownButton.click();
                
                this.dropdownSearch.value = '';
            }
        };

        const removeSelectedTag = (tag) =>
        {
            if (this.element.selectedOptions.length)
            {
                const option = Array.from(this.element.selectedOptions).find((opt) => opt.value === tag.value);

                if (option)
                {
                    option.selected = false;
                }

                updateDropdown();

                this.dropdownButton.click();
                
                this.dropdownSearch.value = '';
            }
        };

        const update = (item) =>
        {
            if (!this.element.multiple)
            {
                this.element.value = item.value;
            }
            else
            {
                Array.from(this.element.options).filter((option) => option.value === item.value)[0].selected = true;
            }

            if (!this.element.multiple)
            {
                this.dropdownButton.click();
            }

            updateDropdown();

            this.dropdownButton.focus();

            if (this.dropdownSearch)
            {
                this.dropdownSearch.value = '';
                this.dropdownSearch.focus();
            }
        };

        const clearSelected = () =>
        {
            if (this.element.value)
            {
                Array.from(this.element.options).forEach((option) =>
                {
                    option.selected = false;
                });
                
                this.element.value = (this.element.multiple) ? [] : '';

                updateDropdown();
            }
        };

        const getPlaceholder = () =>
        {
            if (this.element.getAttribute('placeholder'))
            {
                const text = this.element.getAttribute('placeholder');
                
                if (text.length)
                {
                    return text;
                }
            }
            
            const option = Array.from(this.element.options).filter((option) => (option.value === '' || !option.hasAttribute('value')));
            
            if (option.length > 0)
            {
                if (option[0].textContent.length)
                {
                    return option[0].textContent;
                }
            }
            
            if (this.options.ajax)
            {
                return this.options.lang.typeSearch.replace('[length]', this.options.searchMinLength);
            }
            
            if (this.element.multiple)
            {
                return this.options.lang.placeholderMultiple;
            }
            else
            {
                return this.options.lang.placeholder;
            }
            
            return '';
        };
        
        const updateDropdown = () =>
        {
            if (this.dropdown)
            {
                const selectedItems = getSelectedItems();
                
                if (this.dropdownButton)
                {
                    Array.from(this.dropdownButton.querySelectorAll('data')).forEach((item) =>
                    {
                        item.remove();
                    });
                    
                    this.dropdownButton.insertAdjacentHTML('afterbegin', selectedItems);
                }

                if (this.dropdownMenu)
                {
                    const items = getItems();
                    
                    this.dropdownMenu.innerHTML = items.join('');
                    this.dropdownMenu.innerHTML += getNoResults(items);
                }
                
                if (this.dropdownSearch)
                {
                    this.dropdownSearch.placeholder = (selectedItems.length > 0) ? '' : getPlaceholder();
                }
            }
        };

        const getSelectedItems = () =>
        {
            let items = '';
            
            if (this.element.multiple)
            {
                const selectedOptions = Array.from(this.element.options).filter((option) => (option.selected && option.getAttribute('value')));

                if (selectedOptions.length)
                {
                    selectedOptions.forEach((option) =>
                    {
                        items += `<data class="badge text-bg-primary" value="${option.value}">${option.textContent} <span class="${this.options.icon.removeTag} ms-1"></span></data>`;
                    });
                }
            }
            else
            {
                if (this.element.options.selectedIndex !== -1)
                {
                    const option = this.element.options[this.element.options.selectedIndex];
                    
                    if (option)
                    {
                        if (option.getAttribute('value'))
                        {
                            items += `<data class="text-body-primary" value="${option.value}">${option.textContent}</data>`;
                        }
                    }
                }
            }

            return items;
        };

        const getItems = () =>
        {
            let items = [];
            
            const list = this.element.querySelectorAll('*');
            
            if (list)
            {
                Array.from(list).forEach((option) =>
                {
                    if (option.tagName === 'OPTGROUP')
                    {
                        items.push(`<h6 class="dropdown-header">${option.label}</h6>`);
                    }
                    else if (option.tagName === 'OPTION')
                    {
                        if (option.value.length && option.textContent.length)
                        {
                            const selected = option.selected ? 'active' : '';
                            const disabled = (option.disabled || option.selected) ? 'disabled' : '';
                            const hidden   = ((!option.hasAttribute('value') || option.value === '') ? 'hidden' : '');
                            
                            items.push(`<button type="button" value="${option.value}" class="dropdown-item ${selected}" ${hidden} ${disabled}>${option.textContent}</button>`);
                        }
                    }
                });                
            }
            
            return items;
        };

        const getNoResults = (items) =>
        {
            let label = this.options.lang.noResults;
            
            if (this.dropdownSearch)
            {
                if (this.dropdownSearch.value.length < this.options.searchMinLength)
                {
                    label = this.options.lang.typeSearch.replace('[length]', (this.options.searchMinLength - this.dropdownSearch.value.length));
                }
            }
            
            return `<span ${items.length > 0 ? 'style="display:none;"' : ''} class="dropdown-item text-body-secondary">${label}</span>`;
        };

        const getClearButton = () =>
        {
            if (!this.element.multiple)
            {
                if (this.options.clear)
                {
                    return `<button type="button" class="btn btn-sm bs-clear" title="${this.options.lang.clearSelect}"><span class="${this.options.icon.clear}"></span></button>`;
                }
            }

            return '';
        };

        const getSearchInput = () =>
        {
            return `<input type="text" class="bs-input" placeholder="${getPlaceholder()}" autocomplete="off">`;
        };

        const getDropdownButton = () =>
        {
            let button = `<div class="form-select" data-bs-toggle="dropdown" aria-expanded="false">`
            + getSelectedItems()
            + getSearchInput()
            + `</div>`;
            
            return button;
        };

        const createClearButton = () =>
        {
            if (this.dropdownClearButton)
            {
                this.dropdownClearButton.addEventListener('click', clearSelected);
            }
        };
        
        const createTags = () =>
        {
            if (this.dropdownButton)
            {   
                this.dropdownButton.addEventListener('click', (event) =>
                {
                    if (event.target.tagName === 'SPAN')
                    {
                        removeSelectedTag(event.target.closest('data'));
                    }
                });  
            }
        };

        const createSearch = () =>
        {            
            if (this.dropdown)
            {
                if (this.dropdownSearch)
                {
                    if (this.dropdownButton && this.dropdownMenu)
                    {
                        this.debouncedSearch = debounceFunction((event) =>
                        {
                            if (!this.dropdownButton.classList.contains('show'))
                            {
                                this.dropdownButton.click();
                            }

                            if (this.options.ajax)
                            {
                                searchAjax(this.dropdownSearch.value, (this.options.searchMinLength || 3));
                            }
                            else
                            {
                                search(event, this.dropdownSearch.value.toLowerCase().trim(), (this.options.searchMinLength || 3));
                            }
                        }, this.options.debounceSearch || 300);
                    }

                    this.dropdown.addEventListener('shown.bs.dropdown', () =>
                    {
                        this.dropdownSearch.focus();
                    });

                    this.dropdownSearch.addEventListener('keydown', (event) =>
                    {
                        if (event.key === 'Enter')
                        {
                            event.preventDefault();
                            return false;
                        }
                        
                        if (event.key === 'Backspace')
                        {
                            if (!this.dropdownSearch.value)
                            {
                                if (this.options.clearBackspace)
                                {
                                    removeLastSelectedTag();
                                    
                                    event.preventDefault();
                                    return false;
                                }
                            }
                        }
                    });

                    this.dropdownSearch.addEventListener('keyup', this.debouncedSearch);
                }
            }
        };

        const createDropdown = () =>
        {
            const items = getItems();

            const dropdown = `<div class="dropdown bs-wrapper">`
            + getDropdownButton()
            + `<div class="dropdown-menu" style="max-height:${this.options.maxHeight};overflow-y:auto;">`
            + items.join('')
            + getNoResults(items)
            + `</div>`
            + getClearButton()
            + `</div>`;

            if (this.element.nextElementSibling)
            {
                this.element.nextElementSibling.remove();
            }

            this.element.insertAdjacentHTML('afterend', dropdown);
            
            if (this.element.nextElementSibling)
            {
                const dropdownMenu = this.element.nextElementSibling.querySelector('.dropdown-menu');

                if (dropdownMenu)
                {
                    dropdownMenu.addEventListener('click', (event) =>
                    {
                        if (event.target)
                        {
                            if (event.target.tagName === 'BUTTON')
                            {
                                update(event.target);
                            }
                        }
                    });
                }
            }
            
            return this.element.nextElementSibling;
        };

        const init = () =>
        {
            this.element.style.display = 'none';
            
            this.options.create = (this.options.create && !this.options.ajax);

            this.dropdown = createDropdown();
            
            this.dropdownButton = this.dropdown.querySelector('.form-select');
            
            this.dropdownSearch = this.dropdownButton.querySelector('input');
            
            this.dropdownClearButton = this.dropdown.querySelector('.bs-clear')
            
            this.dropdownMenu = this.dropdown.querySelector('.dropdown-menu');

            createSearch();
            
            createTags();

            createClearButton();

            this.element.addEventListener('change', updateDropdown);  
            
            return this;
        };
        
        this.destroy = () =>
        {
            if (this.dropdown)
            {
                if (this.dropdown.parentNode)
                {
                    this.dropdown.remove();
                }

                this.element.removeEventListener('change', updateDropdown);

                this.element.style.display = '';

                this.dropdown = null;
            }
        };
        
        this.refresh = () =>
        {
            updateDropdown();
        };
        
        this.set = (value) =>
        {
            if (this.element)
            {
                if (value)
                {
                    const isArray = Array.isArray(value);

                    Array.from(this.element.options).forEach((option) =>
                    {
                        if (isArray)
                        {
                            option.selected = value.includes(option.value);
                        }
                        else
                        {
                            option.selected = (option.value === value);
                        }
                    });
                    
                    updateDropdown();
                }
                else
                {
                    clearSelected();
                }

            }
        };
        
        this.get = () =>
        {
            if (this.element.multiple)
            {
                if (this.element.selectedOptions)
                {
                    return Array.from(this.element.selectedOptions).map(({ value }) => value);
                }
            }
            else
            {
                if (this.element.options.selectedIndex !== -1)
                {
                    const option = this.element.options[this.element.options.selectedIndex];

                    if (option)
                    {
                        return option.value;
                    }
                }
            }
            
            return '';
        }
        
        this.toggle = (value, selected) =>
        {
            if (this.element)
            {
                if (value)
                {
                    const isArray = Array.isArray(value);

                    Array.from(this.element.options).forEach((option) =>
                    {
                        if (isArray)
                        {
                            if (value.includes(option.value))
                            {
                                option.selected = selected;
                            }
                        }
                        else
                        {
                            if (option.value === value)
                            {
                                option.selected = selected;
                            }
                        }
                    });
                    
                    updateDropdown();
                }
            }
        };
        
        this.clear = () =>
        {
            clearSelected();
        };

        return init();
    }

    window.bsSelect = bsSelect;
})();
