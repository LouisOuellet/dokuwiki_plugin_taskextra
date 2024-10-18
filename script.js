jQuery(function(jQuery) {
    // Adding a due date form if it doesn't exist
    jQuery('.vcalendar .vtodo').each(function() {
        var taskContainer = jQuery(this);
        var dueRow = taskContainer.find('abbr.due').closest('tr');
        var dueDate = dueRow.length > 0 ? dueRow.find('abbr.due').attr('title').replace('T', ' ').slice(0, 16) : new Date().toISOString().replace('T', ' ').slice(0, 16);

        // Create a due date form if none exists
        var dueDateForm = '<tr>' +
                            '<th class="col4 align">Due date:</th>' +
                            '<td>' +
                              '<abbr class="due" title="' + dueDate + '">' +
                                '<form action="' + window.location.href + '" method="post" accept-charset="utf-8" class="doku_form due">' +
                                  '<div class="no">' +
                                    '<input type="datetime-local" class="due-date-input" value="' + dueDate + '" />' +
                                    '<button class="due-update">Change</button>' +
                                  '</div>' +
                                '</form>' +
                              '</abbr>' +
                            '</td>' +
                          '</tr>';

        if (dueRow.length > 0) {
          dueRow.before(dueDateForm);
          dueRow.remove();
        } else {
          taskContainer.find('tbody').append(dueDateForm);
        }
    });

    // Adding a priority form if it doesn't exist
    jQuery('.vcalendar .vtodo').each(function() {
        var taskContainer = jQuery(this);
        var priorityRow = taskContainer.find('tr.priority');
        var priorityLevel = 'Low'; // Default value

        if (taskContainer.hasClass('priority1')) {
            priorityLevel = 'Normal';
        } else if (taskContainer.hasClass('priority2')) {
            priorityLevel = 'High';
        } else if (taskContainer.hasClass('priority3')) {
            priorityLevel = 'Critical';
        }

        if (priorityRow.length === 0) {

            // Create a priority form if none exists
            var priorityForm = '<tr class="priority">' +
                                '<th class="col4 align">Priority:</th>' +
                                '<td>' +
                                  '<abbr class="priority" title="' + priorityLevel + '">' +
                                    '<form action="' + window.location.href + '" method="post" accept-charset="utf-8" class="doku_form priority">' +
                                      '<div class="no">' +
                                        '<select name="priority">' +
                                          '<option value="0"' + (priorityLevel === 'Low' ? ' selected' : '') + '>Low</option>' +
                                          '<option value="1"' + (priorityLevel === 'Normal' ? ' selected' : '') + '>Normal</option>' +
                                          '<option value="2"' + (priorityLevel === 'High' ? ' selected' : '') + '>High</option>' +
                                          '<option value="3"' + (priorityLevel === 'Critical' ? ' selected' : '') + '>Critical</option>' +
                                        '</select>' +
                                        '<button class="priority-update">Change</button>' +
                                      '</div>' +
                                    '</form>' +
                                  '</abbr>' +
                                '</td>' +
                              '</tr>';
            taskContainer.find('tbody').append(priorityForm);
        }
    });

    // Adding unassign button next to assigned user
    jQuery('.vcalendar .vtodo').each(function() {
        var taskContainer = jQuery(this);
        var assignedRow = taskContainer.find('tr:has(.organizer)');
        var assignedTo = assignedRow.find('.organizer .fn');

        if (assignedTo.length > 0 && assignedRow.find('.unassign-user').length === 0) {
            // Create unassign button if user is assigned
            var unassignButton = '<button class="unassign-user">Unassign</button>';
            assignedRow.find('td').append(unassignButton);
        }
    });

    // Adding unassign button next to assigned user
    jQuery('.vcalendar .vtodo').each(function() {
        var taskContainer = jQuery(this);
        var assignedRow = taskContainer.find('tr:has(.organizer)');
        var assignedTo = assignedRow.find('.organizer .fn');

        if (assignedTo.length > 0 && assignedRow.find('.unassign-user').length === 0) {
            // Create unassign button if user is assigned
            var unassignButton = '<button class="unassign-user">Unassign</button>';
            assignedRow.find('td').append(unassignButton);
        }
    });

    // Event listener to update due date
    jQuery('form.due').on('submit', function(e) {
        e.preventDefault();
        var form = jQuery(this);
        var newDueDate = form.find('input').val();
        if (newDueDate) {
            // Send AJAX request to update the due date
            jQuery.ajax({
                url: DOKU_BASE + 'lib/exe/ajax.php',
                type: 'POST',
                data: {
                    call: 'taskextra_due',
                    due_date: newDueDate,
                    id: JSINFO.id // Current page ID
                },
                success: function(response) {
                    var result = JSON.parse(response);
                    if (result.status === 'success') {
                        location.reload();
                    } else {
                        console.error('Failed to update due date');
                    }
                },
                error: function() {
                    console.error('Error while updating due date');
                }
            });
        }
    });

    // Event listener to update priority
    jQuery('form.priority').on('submit', function(e) {
        e.preventDefault();
        var form = jQuery(this);
        var newPriority = form.find('select').val();
        if (newPriority) {
            // Send AJAX request to update the priority
            jQuery.ajax({
                url: DOKU_BASE + 'lib/exe/ajax.php',
                type: 'POST',
                data: {
                    call: 'taskextra_priority',
                    priority: newPriority,
                    id: JSINFO.id
                },
                success: function(response) {
                    var result = JSON.parse(response);
                    if (result.status === 'success') {
                        location.reload();
                    } else {
                        console.error('Failed to update priority');
                    }
                },
                error: function() {
                    console.error('Error while updating priority');
                }
            });
        }
    });

    // Event listener to unassign user
    jQuery(document).on('click', '.unassign-user', function() {
        var assignedRow = jQuery(this).closest('tr');

        // Send AJAX request to unassign the user
        jQuery.ajax({
            url: DOKU_BASE + 'lib/exe/ajax.php',
            type: 'POST',
            data: {
                call: 'taskextra_unassign',
                id: JSINFO.id // Current page ID
            },
            success: function(response) {
                var result = JSON.parse(response);
                if (result.status === 'success') {
                    assignedRow.remove();
                    location.reload();
                } else {
                    console.error('Failed to unassign user');
                }
            },
            error: function() {
                console.error('Error while unassigning user');
            }
        });
    });
});
