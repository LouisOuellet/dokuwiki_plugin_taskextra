<?php

use dokuwiki\Extension\ActionPlugin;
use dokuwiki\Extension\EventHandler;
use dokuwiki\Extension\Event;

/**
 * DokuWiki Plugin taskextra (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author Louis Ouellet <louis_ouellet@hotmail.com>
 */
class action_plugin_taskextra extends ActionPlugin
{
    /** @inheritDoc */
    public function register(EventHandler $controller)
    {
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handle_ajax');
    }

    /**
     * Event handler for AJAX requests
     *
     * @param Event $event Event object
     * @param mixed $param optional parameter passed when event was registered
     * @return void
     */
    public function handle_ajax(Event $event, $param)
    {
        global $INPUT, $ID, $TEXT;

        switch ($event->data) {
            case 'taskextra_unassign':
            case 'taskextra_due':
            case 'taskextra_priority':
                break;
            default:
                return;
        }

        $event->preventDefault();
        $event->stopPropagation();

        switch ($event->data) {
            case 'taskextra_unassign':
                $this->handle_unassign($event);
                break;
            case 'taskextra_due':
                $this->handle_due($event);
                break;
            case 'taskextra_priority':
                $this->handle_priority($event);
                break;
        }
        exit;
    }

    /**
     * Handle unassigning a task
     *
     * @param Event $event Event object
     * @return void
     */
    private function handle_unassign(Event $event)
    {
        global $INPUT, $ID, $TEXT;

        // Get the page ID from the AJAX request
        $id = $INPUT->str('id');

        // Retrieve the content
        $pageContent = rawWiki($id);

        // Remove the assigned user from the task markup
        $pageContent = preg_replace('/~~TASK:([^\?!]*?)(\?.*?)?(\!*)~~/', '~~TASK:$2$3~~', $pageContent);

        // Save the updated content
        saveWikiText($id, $pageContent, 'Unassigned the user');
        echo json_encode(array('status' => 'success'));
    }

    /**
     * Handle updating the due date of a task
     *
     * @param Event $event Event object
     * @return void
     */
    private function handle_due(Event $event)
    {
        global $INPUT, $ID, $TEXT;

        // Logic to handle updating the due date
        $dueDate = $INPUT->str('due_date');
        $id = $INPUT->str('id');
        if (!$dueDate) {
            echo json_encode(['error' => 'Due date is required']);
            return;
        }

        // Retrieve the content
        $pageContent = rawWiki($id);

        // Check if the due date already exists and update accordingly
        if (preg_match('/~~TASK:([^\?]*?)\?([^!]*)(!*)~~/', $pageContent)) {
            // Update the existing due date
            $pageContent = preg_replace('/~~TASK:([^\?]*?)\?([^!]*)(!*)~~/', '~~TASK:$1?' . $dueDate . '$3~~', $pageContent);
        } else {
            // Add the new due date if none exists
            $pageContent = preg_replace('/~~TASK:([^\?]*?)(!*)~~/', '~~TASK:$1?' . $dueDate . '$2~~', $pageContent);
        }

        // Save the updated content
        saveWikiText($id, $pageContent, 'Updated the due date to: ' . $dueDate);
        echo json_encode(array('status' => 'success'));
    }

    /**
     * Handle updating the priority of a task
     *
     * @param Event $event Event object
     * @return void
     */
    private function handle_priority(Event $event)
    {
        global $INPUT, $ID, $TEXT;

        // Logic to handle updating the priority
        $priority = $INPUT->str('priority');
        $id = $INPUT->str('id');
        if (!$priority && $priority != 0) {
            echo json_encode(['error' => 'Priority is required']);
            return;
        }

        // Retrieve the content
        $pageContent = rawWiki($id);

        // Remove existing priority indicators
        $pageContent = preg_replace('/~~TASK:(.*?)(\?\[.*?\])?(!*)~~/', '~~TASK:$1$2~~', $pageContent);

        // Add the new priority level
        $priorityIndicators = '';
        if($priority > 0) {
          $priorityIndicators = str_repeat('!', $priority);
        }
        $pageContent = preg_replace('/~~TASK:(.*?)(\?\[.*?\])?~~/', '~~TASK:$1$2' . $priorityIndicators . '~~', $pageContent);

        // Save the updated content
        saveWikiText($id, $pageContent, 'Updated the priority to: ' . $priority);
        echo json_encode(array('status' => 'success'));
    }
}
