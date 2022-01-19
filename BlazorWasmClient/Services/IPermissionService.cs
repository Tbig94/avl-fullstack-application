using BlazorWasmClient.Models;
using BlazorWasmClient.Models.ViewModels;

namespace BlazorWasmClient.Services
{
    public interface IPermissionService
    {
        Task GetPermissionForUser(List<string> currentUserRoles);

    }
}
