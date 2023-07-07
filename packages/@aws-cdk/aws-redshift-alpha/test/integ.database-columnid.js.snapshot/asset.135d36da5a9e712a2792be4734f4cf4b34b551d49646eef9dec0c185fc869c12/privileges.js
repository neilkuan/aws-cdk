"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const redshift_data_1 = require("./redshift-data");
const util_1 = require("./util");
async function handler(props, event) {
    const username = props.username;
    const tablePrivileges = props.tablePrivileges;
    const clusterProps = props;
    if (event.RequestType === 'Create') {
        await grantPrivileges(username, tablePrivileges, clusterProps);
        return { PhysicalResourceId: (0, util_1.makePhysicalId)(username, clusterProps, event.RequestId) };
    }
    else if (event.RequestType === 'Delete') {
        await revokePrivileges(username, tablePrivileges, clusterProps);
        return;
    }
    else if (event.RequestType === 'Update') {
        const { replace } = await updatePrivileges(username, tablePrivileges, clusterProps, event.OldResourceProperties);
        const physicalId = replace ? (0, util_1.makePhysicalId)(username, clusterProps, event.RequestId) : event.PhysicalResourceId;
        return { PhysicalResourceId: physicalId };
    }
    else {
        /* eslint-disable-next-line dot-notation */
        throw new Error(`Unrecognized event type: ${event['RequestType']}`);
    }
}
exports.handler = handler;
async function revokePrivileges(username, tablePrivileges, clusterProps) {
    await Promise.all(tablePrivileges.map(({ tableName, actions }) => {
        return (0, redshift_data_1.executeStatement)(`REVOKE ${actions.join(', ')} ON ${tableName} FROM ${username}`, clusterProps);
    }));
}
async function grantPrivileges(username, tablePrivileges, clusterProps) {
    await Promise.all(tablePrivileges.map(({ tableName, actions }) => {
        return (0, redshift_data_1.executeStatement)(`GRANT ${actions.join(', ')} ON ${tableName} TO ${username}`, clusterProps);
    }));
}
async function updatePrivileges(username, tablePrivileges, clusterProps, oldResourceProperties) {
    const oldClusterProps = oldResourceProperties;
    if (clusterProps.clusterName !== oldClusterProps.clusterName || clusterProps.databaseName !== oldClusterProps.databaseName) {
        await grantPrivileges(username, tablePrivileges, clusterProps);
        return { replace: true };
    }
    const oldUsername = oldResourceProperties.username;
    if (oldUsername !== username) {
        await grantPrivileges(username, tablePrivileges, clusterProps);
        return { replace: true };
    }
    const oldTablePrivileges = oldResourceProperties.tablePrivileges;
    if (oldTablePrivileges !== tablePrivileges) {
        await revokePrivileges(username, oldTablePrivileges, clusterProps);
        await grantPrivileges(username, tablePrivileges, clusterProps);
        return { replace: false };
    }
    return { replace: false };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpdmlsZWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByaXZpbGVnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsbURBQW1EO0FBRW5ELGlDQUF3QztBQUdqQyxLQUFLLFVBQVUsT0FBTyxDQUFDLEtBQXFELEVBQUUsS0FBa0Q7SUFDckksTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUNoQyxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDO0lBQzlDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQztJQUUzQixJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssUUFBUSxFQUFFO1FBQ2xDLE1BQU0sZUFBZSxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLElBQUEscUJBQWMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO0tBQ3hGO1NBQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtRQUN6QyxNQUFNLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDaEUsT0FBTztLQUNSO1NBQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVEsRUFBRTtRQUN6QyxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxnQkFBZ0IsQ0FDeEMsUUFBUSxFQUNSLGVBQWUsRUFDZixZQUFZLEVBQ1osS0FBSyxDQUFDLHFCQUF1RSxDQUM5RSxDQUFDO1FBQ0YsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFBLHFCQUFjLEVBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztRQUNoSCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLENBQUM7S0FDM0M7U0FBTTtRQUNMLDJDQUEyQztRQUMzQyxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3JFO0FBQ0gsQ0FBQztBQXhCRCwwQkF3QkM7QUFFRCxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxlQUFpQyxFQUFFLFlBQTBCO0lBQzdHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTtRQUMvRCxPQUFPLElBQUEsZ0NBQWdCLEVBQUMsVUFBVSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLFNBQVMsU0FBUyxRQUFRLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUN6RyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUVELEtBQUssVUFBVSxlQUFlLENBQUMsUUFBZ0IsRUFBRSxlQUFpQyxFQUFFLFlBQTBCO0lBQzVHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTtRQUMvRCxPQUFPLElBQUEsZ0NBQWdCLEVBQUMsU0FBUyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLFNBQVMsT0FBTyxRQUFRLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUN0RyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUVELEtBQUssVUFBVSxnQkFBZ0IsQ0FDN0IsUUFBZ0IsRUFDaEIsZUFBaUMsRUFDakMsWUFBMEIsRUFDMUIscUJBQXFFO0lBRXJFLE1BQU0sZUFBZSxHQUFHLHFCQUFxQixDQUFDO0lBQzlDLElBQUksWUFBWSxDQUFDLFdBQVcsS0FBSyxlQUFlLENBQUMsV0FBVyxJQUFJLFlBQVksQ0FBQyxZQUFZLEtBQUssZUFBZSxDQUFDLFlBQVksRUFBRTtRQUMxSCxNQUFNLGVBQWUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQy9ELE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7S0FDMUI7SUFFRCxNQUFNLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQyxRQUFRLENBQUM7SUFDbkQsSUFBSSxXQUFXLEtBQUssUUFBUSxFQUFFO1FBQzVCLE1BQU0sZUFBZSxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDL0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztLQUMxQjtJQUVELE1BQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUMsZUFBZSxDQUFDO0lBQ2pFLElBQUksa0JBQWtCLEtBQUssZUFBZSxFQUFFO1FBQzFDLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxFQUFFLGtCQUFrQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ25FLE1BQU0sZUFBZSxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDL0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztLQUMzQjtJQUVELE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDNUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW5yZXNvbHZlZCAqL1xuaW1wb3J0ICogYXMgQVdTTGFtYmRhIGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgZXhlY3V0ZVN0YXRlbWVudCB9IGZyb20gJy4vcmVkc2hpZnQtZGF0YSc7XG5pbXBvcnQgeyBDbHVzdGVyUHJvcHMgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IG1ha2VQaHlzaWNhbElkIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IFRhYmxlUHJpdmlsZWdlLCBVc2VyVGFibGVQcml2aWxlZ2VzSGFuZGxlclByb3BzIH0gZnJvbSAnLi4vaGFuZGxlci1wcm9wcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHByb3BzOiBVc2VyVGFibGVQcml2aWxlZ2VzSGFuZGxlclByb3BzICYgQ2x1c3RlclByb3BzLCBldmVudDogQVdTTGFtYmRhLkNsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VFdmVudCkge1xuICBjb25zdCB1c2VybmFtZSA9IHByb3BzLnVzZXJuYW1lO1xuICBjb25zdCB0YWJsZVByaXZpbGVnZXMgPSBwcm9wcy50YWJsZVByaXZpbGVnZXM7XG4gIGNvbnN0IGNsdXN0ZXJQcm9wcyA9IHByb3BzO1xuXG4gIGlmIChldmVudC5SZXF1ZXN0VHlwZSA9PT0gJ0NyZWF0ZScpIHtcbiAgICBhd2FpdCBncmFudFByaXZpbGVnZXModXNlcm5hbWUsIHRhYmxlUHJpdmlsZWdlcywgY2x1c3RlclByb3BzKTtcbiAgICByZXR1cm4geyBQaHlzaWNhbFJlc291cmNlSWQ6IG1ha2VQaHlzaWNhbElkKHVzZXJuYW1lLCBjbHVzdGVyUHJvcHMsIGV2ZW50LlJlcXVlc3RJZCkgfTtcbiAgfSBlbHNlIGlmIChldmVudC5SZXF1ZXN0VHlwZSA9PT0gJ0RlbGV0ZScpIHtcbiAgICBhd2FpdCByZXZva2VQcml2aWxlZ2VzKHVzZXJuYW1lLCB0YWJsZVByaXZpbGVnZXMsIGNsdXN0ZXJQcm9wcyk7XG4gICAgcmV0dXJuO1xuICB9IGVsc2UgaWYgKGV2ZW50LlJlcXVlc3RUeXBlID09PSAnVXBkYXRlJykge1xuICAgIGNvbnN0IHsgcmVwbGFjZSB9ID0gYXdhaXQgdXBkYXRlUHJpdmlsZWdlcyhcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgdGFibGVQcml2aWxlZ2VzLFxuICAgICAgY2x1c3RlclByb3BzLFxuICAgICAgZXZlbnQuT2xkUmVzb3VyY2VQcm9wZXJ0aWVzIGFzIFVzZXJUYWJsZVByaXZpbGVnZXNIYW5kbGVyUHJvcHMgJiBDbHVzdGVyUHJvcHMsXG4gICAgKTtcbiAgICBjb25zdCBwaHlzaWNhbElkID0gcmVwbGFjZSA/IG1ha2VQaHlzaWNhbElkKHVzZXJuYW1lLCBjbHVzdGVyUHJvcHMsIGV2ZW50LlJlcXVlc3RJZCkgOiBldmVudC5QaHlzaWNhbFJlc291cmNlSWQ7XG4gICAgcmV0dXJuIHsgUGh5c2ljYWxSZXNvdXJjZUlkOiBwaHlzaWNhbElkIH07XG4gIH0gZWxzZSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGRvdC1ub3RhdGlvbiAqL1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGV2ZW50IHR5cGU6ICR7ZXZlbnRbJ1JlcXVlc3RUeXBlJ119YCk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcmV2b2tlUHJpdmlsZWdlcyh1c2VybmFtZTogc3RyaW5nLCB0YWJsZVByaXZpbGVnZXM6IFRhYmxlUHJpdmlsZWdlW10sIGNsdXN0ZXJQcm9wczogQ2x1c3RlclByb3BzKSB7XG4gIGF3YWl0IFByb21pc2UuYWxsKHRhYmxlUHJpdmlsZWdlcy5tYXAoKHsgdGFibGVOYW1lLCBhY3Rpb25zIH0pID0+IHtcbiAgICByZXR1cm4gZXhlY3V0ZVN0YXRlbWVudChgUkVWT0tFICR7YWN0aW9ucy5qb2luKCcsICcpfSBPTiAke3RhYmxlTmFtZX0gRlJPTSAke3VzZXJuYW1lfWAsIGNsdXN0ZXJQcm9wcyk7XG4gIH0pKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ3JhbnRQcml2aWxlZ2VzKHVzZXJuYW1lOiBzdHJpbmcsIHRhYmxlUHJpdmlsZWdlczogVGFibGVQcml2aWxlZ2VbXSwgY2x1c3RlclByb3BzOiBDbHVzdGVyUHJvcHMpIHtcbiAgYXdhaXQgUHJvbWlzZS5hbGwodGFibGVQcml2aWxlZ2VzLm1hcCgoeyB0YWJsZU5hbWUsIGFjdGlvbnMgfSkgPT4ge1xuICAgIHJldHVybiBleGVjdXRlU3RhdGVtZW50KGBHUkFOVCAke2FjdGlvbnMuam9pbignLCAnKX0gT04gJHt0YWJsZU5hbWV9IFRPICR7dXNlcm5hbWV9YCwgY2x1c3RlclByb3BzKTtcbiAgfSkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVQcml2aWxlZ2VzKFxuICB1c2VybmFtZTogc3RyaW5nLFxuICB0YWJsZVByaXZpbGVnZXM6IFRhYmxlUHJpdmlsZWdlW10sXG4gIGNsdXN0ZXJQcm9wczogQ2x1c3RlclByb3BzLFxuICBvbGRSZXNvdXJjZVByb3BlcnRpZXM6IFVzZXJUYWJsZVByaXZpbGVnZXNIYW5kbGVyUHJvcHMgJiBDbHVzdGVyUHJvcHMsXG4pOiBQcm9taXNlPHsgcmVwbGFjZTogYm9vbGVhbiB9PiB7XG4gIGNvbnN0IG9sZENsdXN0ZXJQcm9wcyA9IG9sZFJlc291cmNlUHJvcGVydGllcztcbiAgaWYgKGNsdXN0ZXJQcm9wcy5jbHVzdGVyTmFtZSAhPT0gb2xkQ2x1c3RlclByb3BzLmNsdXN0ZXJOYW1lIHx8IGNsdXN0ZXJQcm9wcy5kYXRhYmFzZU5hbWUgIT09IG9sZENsdXN0ZXJQcm9wcy5kYXRhYmFzZU5hbWUpIHtcbiAgICBhd2FpdCBncmFudFByaXZpbGVnZXModXNlcm5hbWUsIHRhYmxlUHJpdmlsZWdlcywgY2x1c3RlclByb3BzKTtcbiAgICByZXR1cm4geyByZXBsYWNlOiB0cnVlIH07XG4gIH1cblxuICBjb25zdCBvbGRVc2VybmFtZSA9IG9sZFJlc291cmNlUHJvcGVydGllcy51c2VybmFtZTtcbiAgaWYgKG9sZFVzZXJuYW1lICE9PSB1c2VybmFtZSkge1xuICAgIGF3YWl0IGdyYW50UHJpdmlsZWdlcyh1c2VybmFtZSwgdGFibGVQcml2aWxlZ2VzLCBjbHVzdGVyUHJvcHMpO1xuICAgIHJldHVybiB7IHJlcGxhY2U6IHRydWUgfTtcbiAgfVxuXG4gIGNvbnN0IG9sZFRhYmxlUHJpdmlsZWdlcyA9IG9sZFJlc291cmNlUHJvcGVydGllcy50YWJsZVByaXZpbGVnZXM7XG4gIGlmIChvbGRUYWJsZVByaXZpbGVnZXMgIT09IHRhYmxlUHJpdmlsZWdlcykge1xuICAgIGF3YWl0IHJldm9rZVByaXZpbGVnZXModXNlcm5hbWUsIG9sZFRhYmxlUHJpdmlsZWdlcywgY2x1c3RlclByb3BzKTtcbiAgICBhd2FpdCBncmFudFByaXZpbGVnZXModXNlcm5hbWUsIHRhYmxlUHJpdmlsZWdlcywgY2x1c3RlclByb3BzKTtcbiAgICByZXR1cm4geyByZXBsYWNlOiBmYWxzZSB9O1xuICB9XG5cbiAgcmV0dXJuIHsgcmVwbGFjZTogZmFsc2UgfTtcbn1cbiJdfQ==